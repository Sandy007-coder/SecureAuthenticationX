from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import logging
import json

from app.database.db import get_db

LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

SECURITY_LOG_FILE = LOG_DIR / "security.log"
ERROR_LOG_FILE = LOG_DIR / "error.log"


class JsonFormatter(logging.Formatter):
    """
    Structured JSON log formatter for machine-readable log output.
    Useful for ingestion into SIEM tools, Splunk, or ELK stack.
    """
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def _build_logger(name: str) -> logging.Logger:
    log = logging.getLogger(name)

    if log.handlers:
        return log

    log.setLevel(logging.DEBUG)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))

    security_handler = logging.FileHandler(SECURITY_LOG_FILE)
    security_handler.setLevel(logging.INFO)
    security_handler.setFormatter(JsonFormatter())

    error_handler = logging.FileHandler(ERROR_LOG_FILE)
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(JsonFormatter())

    log.addHandler(console_handler)
    log.addHandler(security_handler)
    log.addHandler(error_handler)

    return log


logger = _build_logger("SecureAuthX")


def log_event(
    email: str,
    event_type: str,
    ip_address: str,
    user_id: Optional[int] = None,
    user_agent: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> None:
    """
    Record a security event in both the structured log file and the
    security_logs database table.

    Args:
        email:      User email associated with the event.
        event_type: Security event identifier (e.g. LOGIN_SUCCESS).
        ip_address: Source IP address of the request.
        user_id:    Optional user ID for cross-referencing with users table.
        user_agent: Optional HTTP User-Agent string.
        metadata:   Optional dict of additional context (e.g. role, reason).
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    metadata_str = json.dumps(metadata) if metadata else None

    level = _resolve_log_level(event_type)

    log_fn = getattr(logger, level)
    log_fn(
        "event=%s | email=%s | ip=%s | user_id=%s | ua=%s | meta=%s",
        event_type,
        email,
        ip_address,
        user_id or "anon",
        user_agent or "unknown",
        metadata_str or "{}",
    )

    try:
        with get_db() as db:
            db.execute(
                """
                INSERT INTO security_logs (
                    user_id,
                    email,
                    event_type,
                    ip_address,
                    user_agent,
                    metadata,
                    timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    email,
                    event_type,
                    ip_address,
                    user_agent,
                    metadata_str,
                    timestamp,
                ),
            )
    except Exception:
        logger.exception(
            "Failed to persist security event to database | event=%s | email=%s",
            event_type,
            email,
        )


def _resolve_log_level(event_type: str) -> str:
    """
    Map event types to appropriate log levels so log files
    are filterable by severity without post-processing.
    """
    event_type = event_type.upper()

    if any(k in event_type for k in (
        "LOCKED", "FAILURE", "DENIED", "INVALID", "DEACTIVATED", "BREACH"
    )):
        return "warning"

    if any(k in event_type for k in (
        "ERROR", "EXCEPTION", "CRITICAL"
    )):
        return "error"

    return "info"


def log_login_success(email: str, ip: str, user_id: int, role: str, user_agent: str = None) -> None:
    log_event(email, "LOGIN_SUCCESS", ip, user_id=user_id, user_agent=user_agent,
              metadata={"role": role})


def log_login_failure(email: str, ip: str, reason: str, user_agent: str = None) -> None:
    log_event(email, "LOGIN_FAILURE", ip, user_agent=user_agent,
              metadata={"reason": reason})


def log_account_locked(email: str, ip: str, attempts: int, user_agent: str = None) -> None:
    log_event(email, "ACCOUNT_LOCKED", ip, user_agent=user_agent,
              metadata={"failed_attempts": attempts})


def log_register(email: str, ip: str, user_id: int, user_agent: str = None) -> None:
    log_event(email, "REGISTER", ip, user_id=user_id, user_agent=user_agent)


def log_logout(email: str, ip: str, user_id: int, user_agent: str = None) -> None:
    log_event(email, "LOGOUT", ip, user_id=user_id, user_agent=user_agent)


def log_password_changed(email: str, ip: str, user_id: int, user_agent: str = None) -> None:
    log_event(email, "PASSWORD_CHANGED", ip, user_id=user_id, user_agent=user_agent)


def log_profile_updated(email: str, ip: str, user_id: int, user_agent: str = None) -> None:
    log_event(email, "PROFILE_UPDATED", ip, user_id=user_id, user_agent=user_agent)