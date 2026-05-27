"""
app/middleware/admin_middleware.py - Admin role verification middleware.
Provides a decorator that extends token_required by additionally checking
whether the authenticated user holds the 'admin' role.
"""

from functools import wraps
from flask import jsonify, g
from app.middleware.auth_middleware import token_required


def admin_required(f):
    """
    Decorator that protects a route for admin-only access.
    Applies token_required first (JWT verification), then checks
    whether the decoded token payload contains role == 'admin'.

    On success: allows access to the protected route.
    On failure: returns a 403 Forbidden JSON response.

    Usage:
        @admin_bp.route("/stats")
        @admin_required
        def stats():
            ...
    """
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        # g.current_user is set by token_required decorator
        user = g.current_user

        if user.get("role") != "admin":
            return jsonify({
                "success": False,
                "message": "Access denied. Admin privileges required."
            }), 403

        return f(*args, **kwargs)

    return decorated
