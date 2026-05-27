"""
app/database/db.py - Database connection and initialization module.
Handles SQLite connection creation and schema setup using parameterized queries.
"""

import sqlite3
import os

# Path to the SQLite database file
DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")


def get_connection():
    """
    Creates and returns a new SQLite database connection.
    row_factory allows accessing columns by name (dict-like access).
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Access rows as dictionaries
    conn.execute("PRAGMA journal_mode=WAL")  # Enable Write-Ahead Logging for concurrency
    conn.execute("PRAGMA foreign_keys=ON")   # Enforce foreign key constraints
    return conn


def init_db():
    """
    Initializes the database by creating required tables if they don't exist.
    Uses parameterized SQL to prevent injection vulnerabilities.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # ------------------------------------------------------------------
    # users table
    # Stores all registered user accounts and security tracking data
    # ------------------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            username        TEXT    NOT NULL,
            email           TEXT    NOT NULL UNIQUE,
            password        TEXT    NOT NULL,
            role            TEXT    NOT NULL DEFAULT 'user',
            failed_attempts INTEGER NOT NULL DEFAULT 0,
            lock_until      TEXT    DEFAULT NULL,
            created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # ------------------------------------------------------------------
    # security_logs table
    # Stores audit trail of all security-relevant events
    # ------------------------------------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS security_logs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            email       TEXT    NOT NULL,
            event_type  TEXT    NOT NULL,
            ip_address  TEXT    NOT NULL,
            timestamp   TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    conn.close()
