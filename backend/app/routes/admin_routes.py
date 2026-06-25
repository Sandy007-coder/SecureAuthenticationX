from flask import Blueprint, jsonify, request, g
from app.database.db import get_db
from app.middleware.admin_middleware import admin_required, analyst_required
import logging

logger = logging.getLogger(__name__)

admin_bp = Blueprint("admin", __name__)

DEFAULT_LOG_LIMIT = 50
MAX_LOG_LIMIT = 500


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def stats():
    try:
        with get_db() as db:
            total_users = db.execute(
                "SELECT COUNT(*) AS count FROM users"
            ).fetchone()["count"]

            active_users = db.execute(
                "SELECT COUNT(*) AS count FROM users WHERE is_active = 1"
            ).fetchone()["count"]

            total_failed_attempts = db.execute(
                "SELECT COALESCE(SUM(failed_attempts), 0) AS total FROM users"
            ).fetchone()["total"]

            locked_accounts = db.execute(
                """
                SELECT COUNT(*) AS count FROM users
                WHERE lock_until IS NOT NULL
                  AND lock_until > datetime('now')
                """
            ).fetchone()["count"]

            total_logs = db.execute(
                "SELECT COUNT(*) AS count FROM security_logs"
            ).fetchone()["count"]

            logs_last_24h = db.execute(
                """
                SELECT COUNT(*) AS count FROM security_logs
                WHERE timestamp >= datetime('now', '-24 hours')
                """
            ).fetchone()["count"]

            alerts_by_status = db.execute(
                """
                SELECT status, COUNT(*) AS count
                FROM alerts
                GROUP BY status
                """
            ).fetchall()

            alerts_by_severity = db.execute(
                """
                SELECT severity, COUNT(*) AS count
                FROM alerts
                GROUP BY severity
                """
            ).fetchall()

            recent_events = db.execute(
                """
                SELECT event_type, COUNT(*) AS count
                FROM security_logs
                WHERE timestamp >= datetime('now', '-24 hours')
                GROUP BY event_type
                ORDER BY count DESC
                LIMIT 5
                """
            ).fetchall()

        return jsonify({
            "success": True,
            "stats": {
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "locked": locked_accounts,
                    "total_failed_attempts": total_failed_attempts,
                },
                "logs": {
                    "total": total_logs,
                    "last_24h": logs_last_24h,
                    "top_events": [
                        {"event": r["event_type"], "count": r["count"]}
                        for r in recent_events
                    ],
                },
                "alerts": {
                    "by_status": {r["status"]: r["count"] for r in alerts_by_status},
                    "by_severity": {r["severity"]: r["count"] for r in alerts_by_severity},
                },
            },
        }), 200

    except Exception as e:
        logger.error("Failed to fetch admin stats | error=%s", e)
        return jsonify({"success": False, "message": "Failed to retrieve statistics."}), 500


@admin_bp.route("/logs", methods=["GET"])
@admin_required
def logs():
    try:
        limit = min(int(request.args.get("limit", DEFAULT_LOG_LIMIT)), MAX_LOG_LIMIT)
    except (TypeError, ValueError):
        limit = DEFAULT_LOG_LIMIT

    page = max(int(request.args.get("page", 1)), 1)
    offset = (page - 1) * limit

    event_type = request.args.get("event", "").strip().upper() or None
    email_filter = request.args.get("email", "").strip().lower() or None
    ip_filter = request.args.get("ip", "").strip() or None
    date_from = request.args.get("from") or None
    date_to = request.args.get("to") or None

    try:
        conditions = []
        params = []

        if event_type:
            conditions.append("event_type = ?")
            params.append(event_type)
        if email_filter:
            conditions.append("LOWER(email) LIKE ?")
            params.append(f"%{email_filter}%")
        if ip_filter:
            conditions.append("ip_address LIKE ?")
            params.append(f"%{ip_filter}%")
        if date_from:
            conditions.append("timestamp >= ?")
            params.append(date_from)
        if date_to:
            conditions.append("timestamp <= ?")
            params.append(date_to)

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        with get_db() as db:
            total_count = db.execute(
                f"SELECT COUNT(*) AS count FROM security_logs {where_clause}",
                params,
            ).fetchone()["count"]

            records = db.execute(
                f"""
                SELECT
                    sl.id,
                    sl.email,
                    sl.event_type,
                    sl.ip_address,
                    sl.user_agent,
                    sl.metadata,
                    sl.timestamp,
                    u.username,
                    u.role
                FROM security_logs sl
                LEFT JOIN users u ON sl.user_id = u.id
                {where_clause}
                ORDER BY sl.timestamp DESC
                LIMIT ? OFFSET ?
                """,
                params + [limit, offset],
            ).fetchall()

        return jsonify({
            "success": True,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": -(-total_count // limit),
            },
            "logs": [
                {
                    "id": r["id"],
                    "email": r["email"],
                    "username": r["username"],
                    "role": r["role"],
                    "event_type": r["event_type"],
                    "ip_address": r["ip_address"],
                    "user_agent": r["user_agent"],
                    "metadata": r["metadata"],
                    "timestamp": r["timestamp"],
                }
                for r in records
            ],
        }), 200

    except Exception as e:
        logger.error("Failed to fetch security logs | error=%s", e)
        return jsonify({"success": False, "message": "Failed to retrieve logs."}), 500


@admin_bp.route("/locked-accounts", methods=["GET"])
@admin_required
def locked_accounts():
    try:
        with get_db() as db:
            records = db.execute(
                """
                SELECT id, username, email, failed_attempts, lock_until, created_at
                FROM users
                WHERE lock_until IS NOT NULL
                  AND lock_until > datetime('now')
                ORDER BY lock_until DESC
                """
            ).fetchall()

        return jsonify({
            "success": True,
            "count": len(records),
            "locked_accounts": [
                {
                    "id": r["id"],
                    "username": r["username"],
                    "email": r["email"],
                    "failed_attempts": r["failed_attempts"],
                    "lock_until": r["lock_until"],
                    "created_at": r["created_at"],
                }
                for r in records
            ],
        }), 200

    except Exception as e:
        logger.error("Failed to fetch locked accounts | error=%s", e)
        return jsonify({"success": False, "message": "Failed to retrieve locked accounts."}), 500


@admin_bp.route("/unlock/<int:user_id>", methods=["POST"])
@admin_required
def unlock_account(user_id):
    try:
        with get_db() as db:
            user = db.execute(
                "SELECT id, username, email FROM users WHERE id = ?", (user_id,)
            ).fetchone()

            if not user:
                return jsonify({"success": False, "message": "User not found."}), 404

            db.execute(
                """
                UPDATE users
                SET failed_attempts = 0,
                    lock_until = NULL,
                    updated_at = datetime('now')
                WHERE id = ?
                """,
                (user_id,),
            )

            db.execute(
                """
                INSERT INTO security_logs (user_id, email, event_type, ip_address, user_agent)
                VALUES (?, ?, 'ACCOUNT_UNLOCKED', ?, ?)
                """,
                (
                    g.current_user.get("id"),
                    user["email"],
                    g.client_ip,
                    request.headers.get("User-Agent", "unknown"),
                ),
            )

        logger.info(
            "Account unlocked | target_user_id=%s | by_admin_id=%s",
            user_id,
            g.current_user.get("id"),
        )

        return jsonify({
            "success": True,
            "message": f"Account for {user['email']} has been unlocked.",
        }), 200

    except Exception as e:
        logger.error("Failed to unlock account | user_id=%s | error=%s", user_id, e)
        return jsonify({"success": False, "message": "Failed to unlock account."}), 500
    

@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    try:
        with get_db() as db:
            records = db.execute(
                """
                SELECT
                    id, username, email, role,
                    is_active, failed_attempts,
                    last_login, created_at
                FROM users
                ORDER BY created_at DESC
                """
            ).fetchall()

        return jsonify({
            "success": True,
            "count": len(records),
            "users": [
                {
                    "id": r["id"],
                    "username": r["username"],
                    "email": r["email"],
                    "role": r["role"],
                    "is_active": bool(r["is_active"]),
                    "failed_attempts": r["failed_attempts"],
                    "last_login": r["last_login"],
                    "created_at": r["created_at"],
                }
                for r in records
            ],
        }), 200

    except Exception as e:
        logger.error("Failed to fetch user list | error=%s", e)
        return jsonify({"success": False, "message": "Failed to retrieve users."}), 500


@admin_bp.route("/users/<int:user_id>/role", methods=["PATCH"])
@admin_required
def update_user_role(user_id):
    body = request.get_json(silent=True) or {}
    new_role = body.get("role", "").strip().lower()

    valid_roles = {"admin", "analyst", "viewer", "user"}
    if new_role not in valid_roles:
        return jsonify({
            "success": False,
            "message": f"Invalid role. Must be one of: {', '.join(sorted(valid_roles))}.",
        }), 400

    try:
        with get_db() as db:
            user = db.execute(
                "SELECT id, email FROM users WHERE id = ?", (user_id,)
            ).fetchone()

            if not user:
                return jsonify({"success": False, "message": "User not found."}), 404

            db.execute(
                """
                UPDATE users
                SET role = ?, updated_at = datetime('now')
                WHERE id = ?
                """,
                (new_role, user_id),
            )

            db.execute(
                """
                INSERT INTO security_logs (user_id, email, event_type, ip_address, user_agent, metadata)
                VALUES (?, ?, 'ROLE_CHANGED', ?, ?, ?)
                """,
                (
                    g.current_user.get("id"),
                    user["email"],
                    g.client_ip,
                    request.headers.get("User-Agent", "unknown"),
                    f"new_role={new_role}",
                ),
            )

        logger.info(
            "Role updated | target_user_id=%s | new_role=%s | by_admin_id=%s",
            user_id, new_role, g.current_user.get("id"),
        )

        return jsonify({
            "success": True,
            "message": f"Role updated to '{new_role}' for user {user['email']}.",
        }), 200

    except Exception as e:
        logger.error("Failed to update role | user_id=%s | error=%s", user_id, e)
        return jsonify({"success": False, "message": "Failed to update role."}), 500


@admin_bp.route("/users/<int:user_id>/status", methods=["PATCH"])
@admin_required
def update_user_status(user_id):
    body = request.get_json(silent=True) or {}
    is_active = body.get("is_active")

    if not isinstance(is_active, bool):
        return jsonify({
            "success": False,
            "message": "Field 'is_active' must be a boolean.",
        }), 400

    try:
        with get_db() as db:
            user = db.execute(
                "SELECT id, email FROM users WHERE id = ?", (user_id,)
            ).fetchone()

            if not user:
                return jsonify({"success": False, "message": "User not found."}), 404

            db.execute(
                """
                UPDATE users
                SET is_active = ?, updated_at = datetime('now')
                WHERE id = ?
                """,
                (1 if is_active else 0, user_id),
            )

            event = "ACCOUNT_ACTIVATED" if is_active else "ACCOUNT_DEACTIVATED"
            db.execute(
                """
                INSERT INTO security_logs (user_id, email, event_type, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    g.current_user.get("id"),
                    user["email"],
                    event,
                    g.client_ip,
                    request.headers.get("User-Agent", "unknown"),
                ),
            )

        logger.info(
            "User status updated | target_user_id=%s | is_active=%s | by_admin_id=%s",
            user_id, is_active, g.current_user.get("id"),
        )

        action = "activated" if is_active else "deactivated"
        return jsonify({
            "success": True,
            "message": f"Account for {user['email']} has been {action}.",
        }), 200

    except Exception as e:
        logger.error("Failed to update user status | user_id=%s | error=%s", user_id, e)
        return jsonify({"success": False, "message": "Failed to update account status."}), 500