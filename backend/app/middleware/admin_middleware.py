from functools import wraps
from flask import g, jsonify
import logging

from app.middleware.auth_middleware import token_required

logger = logging.getLogger(__name__)

ROLE_HIERARCHY = {
    "admin": 3,
    "analyst": 2,
    "viewer": 1,
    "user": 0,
}


def require_role(*allowed_roles):
    """
    Flexible role-based access control decorator.
    Accepts one or more roles that are permitted to access the route.

    Usage:
        @require_role("admin")
        @require_role("admin", "analyst")
    """
    def decorator(view_func):
        @wraps(view_func)
        @token_required
        def wrapper(*args, **kwargs):
            current_user = getattr(g, "current_user", None)

            if not current_user:
                logger.warning("Role check failed — no authenticated user in context.")
                return jsonify({
                    "success": False,
                    "message": "Authentication required.",
                }), 401

            user_role = current_user.get("role", "user")
            user_id = current_user.get("id", "unknown")

            if user_role not in allowed_roles:
                logger.warning(
                    "Access denied | user_id=%s | role=%s | required=%s",
                    user_id, user_role, allowed_roles,
                )
                return jsonify({
                    "success": False,
                    "message": "Access denied. You do not have permission to perform this action.",
                    "required_roles": list(allowed_roles),
                    "your_role": user_role,
                }), 403

            logger.info(
                "Access granted | user_id=%s | role=%s | endpoint=%s",
                user_id, user_role, view_func.__name__,
            )
            return view_func(*args, **kwargs)

        return wrapper
    return decorator


def require_min_role(minimum_role: str):
    """
    Hierarchy-based access control decorator.
    Grants access to any role at or above the specified minimum level.

    Role hierarchy (highest to lowest): admin > analyst > viewer > user

    Usage:
        @require_min_role("analyst")   # allows analyst and admin
        @require_min_role("viewer")    # allows viewer, analyst, and admin
    """
    def decorator(view_func):
        @wraps(view_func)
        @token_required
        def wrapper(*args, **kwargs):
            current_user = getattr(g, "current_user", None)

            if not current_user:
                return jsonify({
                    "success": False,
                    "message": "Authentication required.",
                }), 401

            user_role = current_user.get("role", "user")
            user_id = current_user.get("id", "unknown")
            min_level = ROLE_HIERARCHY.get(minimum_role, 0)
            user_level = ROLE_HIERARCHY.get(user_role, 0)

            if user_level < min_level:
                logger.warning(
                    "Insufficient role | user_id=%s | role=%s | minimum_required=%s",
                    user_id, user_role, minimum_role,
                )
                return jsonify({
                    "success": False,
                    "message": f"Access denied. Minimum role required: {minimum_role}.",
                    "your_role": user_role,
                }), 403

            return view_func(*args, **kwargs)

        return wrapper
    return decorator


# Convenience shortcuts
admin_required = require_role("admin")
analyst_required = require_min_role("analyst")
viewer_required = require_min_role("viewer")