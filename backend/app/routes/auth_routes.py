"""
app/routes/auth_routes.py - Authentication routes.
Handles user registration, login, logout, and profile retrieval.
Implements account lockout, bcrypt password hashing, JWT cookie auth, and audit logging.
"""

from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, g, make_response

from app import limiter
from app.database.db import get_connection
from app.utils.validators import validate_username, validate_email, validate_password
from app.utils.password_utils import hash_password, verify_password
from app.utils.token_utils import generate_token
from app.utils.logger import log_event
from app.middleware.auth_middleware import token_required

# Blueprint registration
auth_bp = Blueprint("auth", __name__)

# Account lockout configuration
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


# ===========================================================================
# POST /api/auth/register
# ===========================================================================
@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per minute")
def register():
    """
    Registers a new user account.
    - Validates username, email, and password
    - Prevents duplicate email registration
    - Hashes password with bcrypt before storing
    - Logs the registration event
    """
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"success": False, "message": "Request body must be JSON."}), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # ---- Input Validation ----
    is_valid, error = validate_username(username)
    if not is_valid:
        return jsonify({"success": False, "message": error}), 422

    is_valid, error = validate_email(email)
    if not is_valid:
        return jsonify({"success": False, "message": error}), 422

    is_valid, error = validate_password(password)
    if not is_valid:
        return jsonify({"success": False, "message": error}), 422

    conn = get_connection()

    # ---- Duplicate Email Check ----
    existing = conn.execute(
        "SELECT id FROM users WHERE email = ?", (email,)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({"success": False, "message": "An account with this email already exists."}), 409

    # ---- Hash Password & Store User ----
    hashed_pw = hash_password(password)

    conn.execute(
        """
        INSERT INTO users (username, email, password, role, failed_attempts, lock_until, created_at)
        VALUES (?, ?, ?, 'user', 0, NULL, datetime('now'))
        """,
        (username, email, hashed_pw)
    )
    conn.commit()
    conn.close()

    # ---- Audit Log ----
    ip = request.remote_addr or "unknown"
    log_event(email, "REGISTER", ip)

    return jsonify({
        "success": True,
        "message": "Account registered successfully."
    }), 201


# ===========================================================================
# POST /api/auth/login
# ===========================================================================
@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    """
    Authenticates a user and issues a JWT stored in an HTTP-only cookie.
    - Checks account lockout status
    - Verifies hashed password
    - Increments failed attempt counter on failure
    - Resets counter and issues token on success
    - Logs all login events
    """
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"success": False, "message": "Request body must be JSON."}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    ip = request.remote_addr or "unknown"

    # ---- Basic Presence Check ----
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    conn = get_connection()

    # ---- Fetch User by Email (parameterized query) ----
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?", (email,)
    ).fetchone()

    if not user:
        conn.close()
        log_event(email, "LOGIN_FAILURE", ip)
        # Generic message to prevent user enumeration
        return jsonify({"success": False, "message": "Invalid credentials."}), 401

    # ---- Account Lockout Check ----
    if user["lock_until"]:
        lock_until_dt = datetime.fromisoformat(user["lock_until"])
        now_utc = datetime.now(timezone.utc)

        # Make lock_until timezone-aware if it isn't already
        if lock_until_dt.tzinfo is None:
            lock_until_dt = lock_until_dt.replace(tzinfo=timezone.utc)

        if now_utc < lock_until_dt:
            remaining = int((lock_until_dt - now_utc).total_seconds() // 60) + 1
            conn.close()
            log_event(email, "ACCOUNT_LOCKED_ACCESS_ATTEMPT", ip)
            return jsonify({
                "success": False,
                "message": f"Account is temporarily locked. Try again in {remaining} minute(s)."
            }), 403

    # ---- Password Verification ----
    if not verify_password(password, user["password"]):
        # Increment failed attempts counter
        new_attempts = user["failed_attempts"] + 1
        lock_until_value = None

        if new_attempts >= MAX_FAILED_ATTEMPTS:
            # Lock the account for LOCKOUT_DURATION_MINUTES
            lock_until_value = (
                datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            ).isoformat()

            conn.execute(
                "UPDATE users SET failed_attempts = ?, lock_until = ? WHERE email = ?",
                (new_attempts, lock_until_value, email)
            )
            conn.commit()
            conn.close()

            log_event(email, "ACCOUNT_LOCKED", ip)
            return jsonify({
                "success": False,
                "message": f"Too many failed attempts. Account locked for {LOCKOUT_DURATION_MINUTES} minutes."
            }), 403

        conn.execute(
            "UPDATE users SET failed_attempts = ? WHERE email = ?",
            (new_attempts, email)
        )
        conn.commit()
        conn.close()

        log_event(email, "LOGIN_FAILURE", ip)
        attempts_left = MAX_FAILED_ATTEMPTS - new_attempts
        return jsonify({
            "success": False,
            "message": f"Invalid credentials. {attempts_left} attempt(s) remaining before lockout."
        }), 401

    # ---- Successful Login ----
    # Reset failed attempts and clear any existing lock
    conn.execute(
        "UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE email = ?",
        (email,)
    )
    conn.commit()
    conn.close()

    # Generate JWT token
    token = generate_token(user["id"], user["email"], user["role"])

    log_event(email, "LOGIN_SUCCESS", ip)

    # Store token in HTTP-only cookie (not accessible via JavaScript)
    response = make_response(jsonify({
        "success": True,
        "message": "Login successful.",
        "role": user["role"]
    }))

    response.set_cookie(
        "auth_token",
        token,
        httponly=True,       # Prevent JavaScript access (XSS protection)
        secure=False,        # Set to True in production over HTTPS
        samesite="Lax",      # CSRF protection
        max_age=7200         # 2 hours (matches JWT expiry)
    )

    return response, 200


# ===========================================================================
# POST /api/auth/logout
# ===========================================================================
@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout():
    """
    Logs out the authenticated user by clearing the auth_token cookie.
    The cookie is overwritten with an empty value and max_age=0 to force expiry.
    """
    user = g.current_user
    ip = request.remote_addr or "unknown"

    log_event(user.get("email", "unknown"), "LOGOUT", ip)

    response = make_response(jsonify({
        "success": True,
        "message": "Logged out successfully."
    }))

    # Clear the authentication cookie
    response.set_cookie(
        "auth_token",
        "",
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=0           # Immediately expire the cookie
    )

    return response, 200


# ===========================================================================
# GET /api/auth/profile
# ===========================================================================
@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile():
    """
    Returns the authenticated user's profile information.
    Protected by JWT middleware — requires valid auth_token cookie.
    """
    user_payload = g.current_user

    conn = get_connection()
    user = conn.execute(
        "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
        (user_payload["user_id"],)
    ).fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "created_at": user["created_at"]
        }
    }), 200
