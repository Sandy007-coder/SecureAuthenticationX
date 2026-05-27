"""
app/middleware/auth_middleware.py - Authentication middleware.
Provides a decorator to protect routes by verifying the JWT token
stored in the HTTP-only cookie.
"""

from functools import wraps
from flask import request, jsonify, g
from app.utils.token_utils import verify_token


def token_required(f):
    """
    Decorator that protects a route by verifying the JWT token.
    The token must be present in the 'auth_token' HTTP-only cookie.

    On success: injects the decoded payload into Flask's `g` context as `g.current_user`.
    On failure: returns a 401 Unauthorized JSON response.

    Usage:
        @auth_bp.route("/profile")
        @token_required
        def profile():
            user = g.current_user
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Extract token from HTTP-only cookie
        token = request.cookies.get("auth_token")

        if not token:
            return jsonify({
                "success": False,
                "message": "Authentication token is missing. Please log in."
            }), 401

        # Verify and decode the JWT token
        payload = verify_token(token)

        if payload is None:
            return jsonify({
                "success": False,
                "message": "Invalid or expired token. Please log in again."
            }), 401

        # Store user info in Flask's request context
        g.current_user = payload

        return f(*args, **kwargs)

    return decorated
