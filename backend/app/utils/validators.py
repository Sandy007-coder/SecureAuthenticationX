import re
from typing import Optional

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]+$")
EMAIL_PATTERN = re.compile(r"^[\w.\-+]+@[\w.-]+\.\w{2,}$")
SPECIAL_CHARACTER_PATTERN = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-\\/\[\]+=~`';]")
IPV4_PATTERN = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")

MIN_USERNAME_LENGTH = 3
MAX_USERNAME_LENGTH = 30

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

MAX_EMAIL_LENGTH = 255

RESERVED_USERNAMES = {
    "admin", "administrator", "root", "system", "support",
    "null", "undefined", "api", "test", "superuser",
}

DISPOSABLE_EMAIL_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com",
    "guerrillamail.com", "throwawaymail.com", "yopmail.com",
}

VALID_ROLES = {"admin", "analyst", "viewer", "user"}
VALID_ALERT_SEVERITIES = {"Critical", "High", "Medium", "Low"}
VALID_ALERT_STATUSES = {"Open", "Investigating", "Resolved", "False Positive"}


def validate_username(username: str) -> tuple[bool, str]:
    if not isinstance(username, str) or not username:
        return False, "Username is required."

    normalized = username.strip()

    if len(normalized) < MIN_USERNAME_LENGTH:
        return False, f"Username must be at least {MIN_USERNAME_LENGTH} characters long."

    if len(normalized) > MAX_USERNAME_LENGTH:
        return False, f"Username must not exceed {MAX_USERNAME_LENGTH} characters."

    if not USERNAME_PATTERN.fullmatch(normalized):
        return False, "Username can only contain letters, numbers, and underscores."

    if normalized.startswith("_") or normalized.endswith("_"):
        return False, "Username cannot start or end with an underscore."

    if "__" in normalized:
        return False, "Username cannot contain consecutive underscores."

    if normalized.lower() in RESERVED_USERNAMES:
        return False, "This username is reserved. Please choose another."

    return True, ""


def validate_email(email: str, allow_disposable: bool = False) -> tuple[bool, str]:
    if not isinstance(email, str) or not email:
        return False, "Email is required."

    normalized = email.strip().lower()

    if len(normalized) > MAX_EMAIL_LENGTH:
        return False, "Email address is too long."

    if not EMAIL_PATTERN.fullmatch(normalized):
        return False, "Invalid email format."

    if not allow_disposable:
        domain = normalized.rsplit("@", 1)[-1]
        if domain in DISPOSABLE_EMAIL_DOMAINS:
            return False, "Disposable email addresses are not allowed."

    return True, ""


def validate_password(password: str) -> tuple[bool, str]:
    if not isinstance(password, str) or not password:
        return False, "Password is required."

    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."

    if len(password) > MAX_PASSWORD_LENGTH:
        return False, f"Password must not exceed {MAX_PASSWORD_LENGTH} characters."

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."

    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."

    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit."

    if not SPECIAL_CHARACTER_PATTERN.search(password):
        return False, "Password must contain at least one special character."

    if re.search(r"(.)\1{3,}", password):
        return False, "Password cannot contain a character repeated 4 or more times in a row."

    return True, ""


def validate_ip_address(ip: str) -> tuple[bool, str]:
    if not isinstance(ip, str) or not ip:
        return False, "IP address is required."

    ip = ip.strip()

    if not IPV4_PATTERN.fullmatch(ip):
        return False, "Invalid IPv4 address format."

    octets = ip.split(".")
    if not all(0 <= int(octet) <= 255 for octet in octets):
        return False, "IP address octets must be between 0 and 255."

    return True, ""


def validate_role(role: str) -> tuple[bool, str]:
    if not isinstance(role, str) or not role:
        return False, "Role is required."

    if role.strip().lower() not in VALID_ROLES:
        return False, f"Role must be one of: {', '.join(sorted(VALID_ROLES))}."

    return True, ""


def validate_alert_severity(severity: str) -> tuple[bool, str]:
    if not isinstance(severity, str) or not severity:
        return False, "Severity is required."

    if severity not in VALID_ALERT_SEVERITIES:
        return False, f"Severity must be one of: {', '.join(VALID_ALERT_SEVERITIES)}."

    return True, ""


def validate_alert_status(status: str) -> tuple[bool, str]:
    if not isinstance(status, str) or not status:
        return False, "Status is required."

    if status not in VALID_ALERT_STATUSES:
        return False, f"Status must be one of: {', '.join(VALID_ALERT_STATUSES)}."

    return True, ""


def validate_pagination(
    page: Optional[str],
    limit: Optional[str],
    max_limit: int = 200,
    default_limit: int = 50,
) -> tuple[int, int]:
    """
    Safely parse and clamp pagination parameters from query strings.
    Always returns valid (page, limit) integers — never raises.
    """
    try:
        parsed_page = max(int(page), 1) if page else 1
    except (TypeError, ValueError):
        parsed_page = 1

    try:
        parsed_limit = int(limit) if limit else default_limit
        parsed_limit = max(1, min(parsed_limit, max_limit))
    except (TypeError, ValueError):
        parsed_limit = default_limit

    return parsed_page, parsed_limit

def sanitize_text_input(value: str, max_length: int = 1000) -> str:
    """
    Strip whitespace and enforce a maximum length on free-text input
    such as analyst notes or alert descriptions.
    """
    if not isinstance(value, str):
        return ""

    return value.strip()[:max_length]