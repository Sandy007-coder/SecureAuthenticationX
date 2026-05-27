"""
app/routes/admin_routes.py - Admin dashboard API routes.
Provides endpoints for platform statistics, audit logs, and locked account management.
All routes are protected by admin_required middleware (JWT + role check).
"""

from flask import Blueprint, request, jsonify

from app.database.db import get_connection
from app.middleware.admin_middleware import admin_required

# Blueprint registration
admin_bp = Blueprint("admin", __name__)


# ===========================================================================
# GET /api/admin/stats
# ===========================================================================
@admin_bp.route("/stats", methods=["GET"])
@admin_required
def stats():
    """
    Returns platform-level statistics for the admin dashboard:
    - Total registered users
    - Total failed login attempts (across all users)
    - Total locked accounts (currently locked)
    - Total security log entries
    """
    conn = get_connection()

    # Total number of registered users
    total_users = conn.execute(
        "SELECT COUNT(*) AS count FROM users"
    ).fetchone()["count"]

    # Sum of all failed login attempts across all users
    total_failed_attempts = conn.execute(
        "SELECT SUM(failed_attempts) AS total FROM users"
    ).fetchone()["total"] or 0

    # Count users whose lock_until is still in the future (currently locked)
    locked_accounts = conn.execute(
        """
        SELECT COUNT(*) AS count FROM users
        WHERE lock_until IS NOT NULL AND lock_until > datetime('now')
        """
    ).fetchone()["count"]

    # Total entries in the security_logs table
    total_logs = conn.execute(
        "SELECT COUNT(*) AS count FROM security_logs"
    ).fetchone()["count"]

    conn.close()

    return jsonify({
        "success": True,
        "stats": {
            "total_users": total_users,
            "total_failed_attempts": total_failed_attempts,
            "locked_accounts": locked_accounts,
            "total_security_logs": total_logs
        }
    }), 200


# ===========================================================================
# GET /api/admin/logs
# ===========================================================================
@admin_bp.route("/logs", methods=["GET"])
@admin_required
def logs():
    """
    Returns recent security audit log entries.
    Supports optional query parameters:
    - limit  (int): Max number of entries to return (default: 50, max: 200)
    - event  (str): Filter by event_type (e.g., LOGIN_FAILURE, ACCOUNT_LOCKED)
    """
    # Parse query parameters safely
    try:
        limit = min(int(request.args.get("limit", 50)), 200)
    except (ValueError, TypeError):
        limit = 50

    event_filter = request.args.get("event", None)

    conn = get_connection()

    if event_filter:
        # Filter by specific event type using parameterized query
        rows = conn.execute(
            """
            SELECT id, email, event_type, ip_address, timestamp
            FROM security_logs
            WHERE event_type = ?
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (event_filter.upper(), limit)
        ).fetchall()
    else:
        # Return all recent logs
        rows = conn.execute(
            """
            SELECT id, email, event_type, ip_address, timestamp
            FROM security_logs
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (limit,)
        ).fetchall()

    conn.close()

    log_entries = [
        {
            "id": row["id"],
            "email": row["email"],
            "event_type": row["event_type"],
            "ip_address": row["ip_address"],
            "timestamp": row["timestamp"]
        }
        for row in rows
    ]

    return jsonify({
        "success": True,
        "count": len(log_entries),
        "logs": log_entries
    }), 200


# ===========================================================================
# GET /api/admin/locked-accounts
# ===========================================================================
@admin_bp.route("/locked-accounts", methods=["GET"])
@admin_required
def locked_accounts():
    """
    Returns a list of all currently locked user accounts.
    An account is considered locked if its lock_until timestamp is in the future.
    """
    conn = get_connection()

    rows = conn.execute(
        """
        SELECT id, username, email, failed_attempts, lock_until, created_at
        FROM users
        WHERE lock_until IS NOT NULL AND lock_until > datetime('now')
        ORDER BY lock_until DESC
        """
    ).fetchall()

    conn.close()

    accounts = [
        {
            "id": row["id"],
            "username": row["username"],
            "email": row["email"],
            "failed_attempts": row["failed_attempts"],
            "lock_until": row["lock_until"],
            "created_at": row["created_at"]
        }
        for row in rows
    ]

    return jsonify({
        "success": True,
        "count": len(accounts),
        "locked_accounts": accounts
    }), 200
