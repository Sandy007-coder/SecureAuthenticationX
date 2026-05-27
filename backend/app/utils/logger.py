"""
app/utils/logger.py - Audit logging system.
Logs security events to both the log file and the security_logs database table.
"""

import logging
import os
from datetime import datetime, timezone

from app.database.db import get_connection

# -----------------------------------------------------------------------
# File Logger Setup
# -----------------------------------------------------------------------
LOG_PATH = os.path.join(os.path.dirname(__file__), "..", "logs", "security.log")
LOG_PATH = os.path.abspath(LOG_PATH)

# Ensure the logs directory exists
os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

# Configure the Python logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH),        # Write to log file
        logging.StreamHandler()               # Also print to console
    ]
)

logger = logging.getLogger("SecureAuthX")


# -----------------------------------------------------------------------
# Audit Log Function
# -----------------------------------------------------------------------
def log_event(email: str, event_type: str, ip_address: str):
    """
    Logs a security event to both the log file and the security_logs database table.

    Args:
        email (str): The email address associated with the event.
        event_type (str): Type of event (e.g., LOGIN_SUCCESS, LOGIN_FAILURE, REGISTER, etc.)
        ip_address (str): The IP address of the client making the request.
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{event_type}] Email: {email} | IP: {ip_address} | Time: {timestamp}"

    # Write to log file
    logger.info(log_message)

    # Write to database using parameterized query (SQL injection safe)
    try:
        conn = get_connection()
        conn.execute(
            """
            INSERT INTO security_logs (email, event_type, ip_address, timestamp)
            VALUES (?, ?, ?, ?)
            """,
            (email, event_type, ip_address, timestamp)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to write audit log to database: {e}")
