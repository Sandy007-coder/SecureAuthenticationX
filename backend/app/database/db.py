from pathlib import Path
from contextlib import contextmanager
import sqlite3
import logging

logger = logging.getLogger(__name__)

DATABASE_FILE = Path(__file__).resolve().parent / "database.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_FILE, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode = WAL")
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA synchronous = NORMAL")
    connection.execute("PRAGMA cache_size = -64000")
    connection.execute("PRAGMA temp_store = MEMORY")
    return connection


@contextmanager
def get_db():
    connection = get_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _get_existing_columns(connection, table_name: str) -> set:
    rows = connection.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()
    return {row["name"] for row in rows}


def _table_exists(connection, table_name: str) -> bool:
    result = connection.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,)
    ).fetchone()
    return result is not None


def _migrate_existing_tables(connection) -> None:
    """
    Safely add missing columns to existing tables.
    SQLite ALTER TABLE only supports constant defaults —
    no function calls like datetime('now') allowed here.
    """

    if _table_exists(connection, "users"):
        users_migrations = [
            ("is_active",  "INTEGER NOT NULL DEFAULT 1"),
            ("last_login", "TEXT DEFAULT NULL"),
            ("updated_at", "TEXT DEFAULT NULL"),
        ]

        existing = _get_existing_columns(connection, "users")

        for column_name, column_def in users_migrations:
            if column_name not in existing:
                connection.execute(
                    f"ALTER TABLE users ADD COLUMN {column_name} {column_def}"
                )
                logger.info("Migration: added column '%s' to users table.", column_name)

    if _table_exists(connection, "security_logs"):
        logs_migrations = [
            ("user_id",    "INTEGER DEFAULT NULL"),
            ("user_agent", "TEXT DEFAULT NULL"),
            ("metadata",   "TEXT DEFAULT NULL"),
        ]

        existing_logs = _get_existing_columns(connection, "security_logs")

        for column_name, column_def in logs_migrations:
            if column_name not in existing_logs:
                connection.execute(
                    f"ALTER TABLE security_logs ADD COLUMN {column_name} {column_def}"
                )
                logger.info("Migration: added column '%s' to security_logs table.", column_name)


def init_db() -> None:
    schema_statements = (
        """
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            username        TEXT    NOT NULL,
            email           TEXT    NOT NULL UNIQUE,
            password        TEXT    NOT NULL,
            role            TEXT    NOT NULL DEFAULT 'user'
                          CHECK(role IN ('user', 'admin', 'analyst', 'viewer')),
            failed_attempts INTEGER NOT NULL DEFAULT 0,
            lock_until      TEXT    DEFAULT NULL,
            is_active       INTEGER NOT NULL DEFAULT 1,
            last_login      TEXT    DEFAULT NULL,
            created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS security_logs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER DEFAULT NULL,
            email       TEXT    NOT NULL,
            event_type  TEXT    NOT NULL,
            ip_address  TEXT    NOT NULL,
            user_agent  TEXT    DEFAULT NULL,
            metadata    TEXT    DEFAULT NULL,
            timestamp   TEXT    NOT NULL DEFAULT (datetime('now'))
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS alerts (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id     TEXT    NOT NULL UNIQUE,
            title        TEXT    NOT NULL,
            severity     TEXT    NOT NULL CHECK(severity IN ('Critical', 'High', 'Medium', 'Low')),
            status       TEXT    NOT NULL DEFAULT 'Open'
                         CHECK(status IN ('Open', 'Investigating', 'Resolved', 'False Positive')),
            source_ip    TEXT    DEFAULT NULL,
            target       TEXT    DEFAULT NULL,
            attack_type  TEXT    DEFAULT NULL,
            description  TEXT    DEFAULT NULL,
            assigned_to  INTEGER DEFAULT NULL,
            resolved_at  TEXT    DEFAULT NULL,
            created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS alert_notes (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id   INTEGER NOT NULL,
            user_id    INTEGER NOT NULL,
            note       TEXT    NOT NULL,
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            token      TEXT    NOT NULL UNIQUE,
            expires_at TEXT    NOT NULL,
            revoked    INTEGER NOT NULL DEFAULT 0,
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        )
        """,
        "CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_logs_email      ON security_logs(email)",
        "CREATE INDEX IF NOT EXISTS idx_logs_timestamp  ON security_logs(timestamp)",
        "CREATE INDEX IF NOT EXISTS idx_alerts_status   ON alerts(status)",
        "CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity)",
        "CREATE INDEX IF NOT EXISTS idx_refresh_token   ON refresh_tokens(token)",
    )

    with get_db() as connection:
        cursor = connection.cursor()

        for statement in schema_statements:
            cursor.execute(statement)

        _migrate_existing_tables(connection)

        logger.info("Database schema initialized and migrated successfully.")


def health_check() -> dict:
    try:
        with get_db() as connection:
            connection.execute("SELECT 1")
        return {"status": "healthy", "database": str(DATABASE_FILE)}
    except Exception as e:
        logger.error("Database health check failed: %s", e)
        return {"status": "unhealthy", "error": str(e)}