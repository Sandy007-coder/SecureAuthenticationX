from functools import wraps
from flask import g, jsonify, request
import logging

from app.utils.token_utils import verify_token

logger = logging.getLogger(__name__)


def token_required(view_func):
    """
    Protect a route with JWT authentication.

    Checks for a valid token in this order:
      1. HTTP-only cookie  → auth_token
      2. Authorization header → Bearer <token>

    On success, attaches the decoded payload to g.current_user.
    """

    @wraps(view_func)
    def wrapper(*args, **kwargs):
        auth_token = _extract_token()

        if not auth_token:
            logger.warning(
                "Unauthenticated request | endpoint=%s | ip=%s",
                request.endpoint,
                _get_client_ip(),
            )
            return jsonify({
                "success": False,
                "message": "Authentication required. Please log in.",
            }), 401

        user_claims = verify_token(auth_token)

        if user_claims is None:
            logger.warning(
                "Invalid or expired token | endpoint=%s | ip=%s",
                request.endpoint,
                _get_client_ip(),
            )
            return jsonify({
                "success": False,
                "message": "Session expired or invalid. Please log in again.",
            }), 401

        if not user_claims.get("is_active", True):
            logger.warning(
                "Inactive account attempted access | user_id=%s",
                user_claims.get("id"),
            )
            return jsonify({
                "success": False,
                "message": "Your account has been deactivated. Contact support.",
            }), 403

        g.current_user = user_claims
        g.client_ip = _get_client_ip()

        logger.debug(
            "Authenticated | user_id=%s | role=%s | endpoint=%s",
            user_claims.get("id"),
            user_claims.get("role"),
            request.endpoint,
        )

        return view_func(*args, **kwargs)

    return wrapper


def _extract_token() -> str | None:
    """
    Pull the JWT from the cookie first, then fall back to the
    Authorization header for API clients that cannot use cookies.
    """
    token = request.cookies.get("auth_token")

    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[len("Bearer "):]

    return token or None


def _get_client_ip() -> str:
    """
    Resolve the real client IP, respecting reverse-proxy headers.
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.remote_addr or "unknown"