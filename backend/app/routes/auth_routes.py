from datetime import datetime, timedelta, timezone

from flask import Blueprint, g, jsonify, make_response, request

from app import limiter
from app.database.db import get_db
from app.middleware.auth_middleware import token_required
from app.utils.logger import log_event
from app.utils.password_utils import hash_password, verify_password
from app.utils.token_utils import generate_token
from app.utils.validators import validate_email, validate_password, validate_username
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

AUTH_COOKIE_NAME = "auth_token"
AUTH_COOKIE_MAX_AGE = 7200


def _get_client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def _set_auth_cookie(response, token: str) -> None:
    response.set_cookie(
        AUTH_COOKIE_NAME,
        token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=AUTH_COOKIE_MAX_AGE,
    )


def _clear_auth_cookie(response) -> None:
    response.set_cookie(
        AUTH_COOKIE_NAME,
        "",
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=0,
    )

@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10 per minute")
def register():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"success": False, "message": "Request body must be JSON."}), 400

    username = payload.get("username", "").strip()
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    client_ip = _get_client_ip()

    for validator, value in (
        (validate_username, username),
        (validate_email, email),
        (validate_password, password),
    ):
        is_valid, error_message = validator(value)
        if not is_valid:
            return jsonify({"success": False, "message": error_message}), 422

    try:
        with get_db() as db:
            existing = db.execute(
                "SELECT id FROM users WHERE email = ?", (email,)
            ).fetchone()

            if existing:
                return jsonify({
                    "success": False,
                    "message": "An account with this email already exists.",
                }), 409

            password_hash = hash_password(password)

            db.execute(
                """
                INSERT INTO users (username, email, password, role, failed_attempts, lock_until)
                VALUES (?, ?, ?, 'user', 0, NULL)
                """,
                (username, email, password_hash),
            )

        log_event(email, "REGISTER", client_ip, user_agent=request.headers.get("User-Agent"))
        logger.info("New user registered | email=%s | ip=%s", email, client_ip)

        return jsonify({
            "success": True,
            "message": "Account registered successfully.",
        }), 201

    except Exception as e:
        logger.error("Registration failed | email=%s | error=%s", email, e)
        return jsonify({"success": False, "message": "Registration failed. Please try again."}), 500


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"success": False, "message": "Request body must be JSON."}), 400

    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    client_ip = _get_client_ip()
    user_agent = request.headers.get("User-Agent", "unknown")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    try:
        with get_db() as db:
            user = db.execute(
                "SELECT * FROM users WHERE email = ?", (email,)
            ).fetchone()

            if not user:
                log_event(email, "LOGIN_FAILURE_USER_NOT_FOUND", client_ip, user_agent=user_agent)
                # Generic message — do not reveal whether email exists
                return jsonify({"success": False, "message": "Invalid credentials."}), 401

            if not user["is_active"]:
                log_event(email, "LOGIN_FAILURE_INACTIVE", client_ip, user_agent=user_agent)
                return jsonify({
                    "success": False,
                    "message": "This account has been deactivated. Contact support.",
                }), 403

            if user["lock_until"]:
                lock_until = datetime.fromisoformat(user["lock_until"])
                if lock_until.tzinfo is None:
                    lock_until = lock_until.replace(tzinfo=timezone.utc)

                if datetime.now(timezone.utc) < lock_until:
                    remaining = int((lock_until - datetime.now(timezone.utc)).total_seconds() // 60) + 1
                    log_event(email, "LOGIN_ATTEMPT_WHILE_LOCKED", client_ip, user_agent=user_agent)
                    return jsonify({
                        "success": False,
                        "message": f"Account is temporarily locked. Try again in {remaining} minute(s).",
                    }), 403

            if not verify_password(password, user["password"]):
                failed_attempts = user["failed_attempts"] + 1

                if failed_attempts >= MAX_FAILED_ATTEMPTS:
                    lock_until_value = (
                        datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
                    ).isoformat()

                    db.execute(
                        """
                        UPDATE users
                        SET failed_attempts = ?, lock_until = ?, updated_at = datetime('now')
                        WHERE email = ?
                        """,
                        (failed_attempts, lock_until_value, email),
                    )

                    log_event(email, "ACCOUNT_LOCKED", client_ip, user_agent=user_agent)
                    logger.warning("Account locked | email=%s | ip=%s", email, client_ip)

                    return jsonify({
                        "success": False,
                        "message": f"Too many failed attempts. Account locked for {LOCKOUT_DURATION_MINUTES} minutes.",
                    }), 403

                db.execute(
                    """
                    UPDATE users
                    SET failed_attempts = ?, updated_at = datetime('now')
                    WHERE email = ?
                    """,
                    (failed_attempts, email),
                )

                log_event(email, "LOGIN_FAILURE", client_ip, user_agent=user_agent)

                remaining_attempts = MAX_FAILED_ATTEMPTS - failed_attempts
                return jsonify({
                    "success": False,
                    "message": f"Invalid credentials. {remaining_attempts} attempt(s) remaining before lockout.",
                }), 401

            db.execute(
                """
                UPDATE users
                SET failed_attempts = 0,
                    lock_until = NULL,
                    last_login = datetime('now'),
                    updated_at = datetime('now')
                WHERE email = ?
                """,
                (email,),
            )

        token = generate_token(
            user_id=user["id"],
            email=user["email"],
            role=user["role"],
            is_active=bool(user["is_active"]),
        )

        log_event(email, "LOGIN_SUCCESS", client_ip, user_agent=user_agent)
        logger.info("Login successful | email=%s | role=%s | ip=%s", email, user["role"], client_ip)

        response = make_response(jsonify({
            "success": True,
            "message": "Login successful.",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
            },
        }))

        _set_auth_cookie(response, token)
        return response, 200

    except Exception as e:
        logger.error("Login error | email=%s | error=%s", email, e)
        return jsonify({"success": False, "message": "Login failed. Please try again."}), 500


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout():
    current_user = g.current_user
    client_ip = _get_client_ip()

    log_event(
        current_user.get("email", "unknown"),
        "LOGOUT",
        client_ip,
        user_agent=request.headers.get("User-Agent"),
    )

    logger.info("User logged out | user_id=%s | ip=%s", current_user.get("id"), client_ip)

    response = make_response(jsonify({"success": True, "message": "Logged out successfully."}))
    _clear_auth_cookie(response)
    return response, 200


@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile():
    current_user = g.current_user

    try:
        with get_db() as db:
            user = db.execute(
                """
                SELECT id, username, email, role, is_active, last_login, created_at
                FROM users
                WHERE id = ?
                """,
                (current_user["user_id"],),
            ).fetchone()

        if not user:
            return jsonify({"success": False, "message": "User not found."}), 404

        return jsonify({
            "success": True,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "is_active": bool(user["is_active"]),
                "last_login": user["last_login"],
                "created_at": user["created_at"],
            },
        }), 200

    except Exception as e:
        logger.error("Profile fetch failed | user_id=%s | error=%s", current_user.get("user_id"), e)
        return jsonify({"success": False, "message": "Failed to retrieve profile."}), 500


@auth_bp.route("/profile", methods=["PATCH"])
@token_required
def update_profile():
    current_user = g.current_user
    payload = request.get_json(silent=True) or {}
    client_ip = _get_client_ip()

    username = payload.get("username", "").strip()
    email = payload.get("email", "").strip().lower()

    if username:
        is_valid, error = validate_username(username)
        if not is_valid:
            return jsonify({"success": False, "message": error}), 422

    if email:
        is_valid, error = validate_email(email)
        if not is_valid:
            return jsonify({"success": False, "message": error}), 422

    if not username and not email:
        return jsonify({"success": False, "message": "Nothing to update."}), 400

    try:
        with get_db() as db:
            if email:
                existing = db.execute(
                    "SELECT id FROM users WHERE email = ? AND id != ?",
                    (email, current_user["user_id"]),
                ).fetchone()
                if existing:
                    return jsonify({
                        "success": False,
                        "message": "This email is already in use.",
                    }), 409

            fields, params = [], []
            if username:
                fields.append("username = ?")
                params.append(username)
            if email:
                fields.append("email = ?")
                params.append(email)

            fields.append("updated_at = datetime('now')")
            params.append(current_user["user_id"])

            db.execute(
                f"UPDATE users SET {', '.join(fields)} WHERE id = ?",
                params,
            )

        log_event(
            current_user.get("email"),
            "PROFILE_UPDATED",
            client_ip,
            user_agent=request.headers.get("User-Agent"),
        )

        logger.info("Profile updated | user_id=%s", current_user.get("user_id"))

        return jsonify({"success": True, "message": "Profile updated successfully."}), 200

    except Exception as e:
        logger.error("Profile update failed | user_id=%s | error=%s", current_user.get("user_id"), e)
        return jsonify({"success": False, "message": "Failed to update profile."}), 500


@auth_bp.route("/change-password", methods=["POST"])
@token_required
@limiter.limit("5 per minute")
def change_password():
    current_user = g.current_user
    payload = request.get_json(silent=True) or {}
    client_ip = _get_client_ip()

    current_password = payload.get("currentPassword", "")
    new_password = payload.get("newPassword", "")
    confirm_password = payload.get("confirmPassword", "")

    if not all([current_password, new_password, confirm_password]):
        return jsonify({"success": False, "message": "All password fields are required."}), 400

    if new_password != confirm_password:
        return jsonify({"success": False, "message": "New passwords do not match."}), 400

    is_valid, error = validate_password(new_password)
    if not is_valid:
        return jsonify({"success": False, "message": error}), 422

    try:
        with get_db() as db:
            user = db.execute(
                "SELECT password FROM users WHERE id = ?",
                (current_user["user_id"],),
            ).fetchone()

            if not user or not verify_password(current_password, user["password"]):
                log_event(
                    current_user.get("email"),
                    "PASSWORD_CHANGE_FAILURE",
                    client_ip,
                    user_agent=request.headers.get("User-Agent"),
                )
                return jsonify({"success": False, "message": "Current password is incorrect."}), 401

            new_hash = hash_password(new_password)
            db.execute(
                """
                UPDATE users
                SET password = ?, updated_at = datetime('now')
                WHERE id = ?
                """,
                (new_hash, current_user["user_id"]),
            )

        log_event(
            current_user.get("email"),
            "PASSWORD_CHANGED",
            client_ip,
            user_agent=request.headers.get("User-Agent"),
        )

        logger.info("Password changed | user_id=%s | ip=%s", current_user.get("user_id"), client_ip)

        return jsonify({"success": True, "message": "Password changed successfully."}), 200

    except Exception as e:
        logger.error("Password change failed | user_id=%s | error=%s", current_user.get("user_id"), e)
        return jsonify({"success": False, "message": "Failed to change password."}), 500