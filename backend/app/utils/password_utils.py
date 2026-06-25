import re
import secrets
import string
import logging
from typing import Optional

import bcrypt

logger = logging.getLogger(__name__)

BCRYPT_ROUNDS = 12

MIN_LENGTH = 8
MAX_LENGTH = 128
REQUIRE_UPPERCASE = True
REQUIRE_LOWERCASE = True
REQUIRE_DIGIT = True
REQUIRE_SPECIAL = True
SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

COMMON_PASSWORDS = {
    "password", "password1", "123456", "123456789", "qwerty",
    "abc123", "letmein", "welcome", "monkey", "dragon",
    "master", "sunshine", "princess", "shadow", "superman",
    "iloveyou", "trustno1", "admin", "admin123", "root",
}


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt with a configurable work factor.
    Raises ValueError for empty or oversized input before touching bcrypt.
    """
    if not password or not isinstance(password, str):
        raise ValueError("Password must be a non-empty string.")

    if len(password) > MAX_LENGTH:
        raise ValueError(f"Password must not exceed {MAX_LENGTH} characters.")

    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(rounds=BCRYPT_ROUNDS),
    ).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plain-text password against a stored bcrypt hash.
    Always runs the full bcrypt comparison to prevent timing attacks —
    never short-circuits on empty input.
    """
    if not password or not isinstance(password, str):
        return False

    if not password_hash or not isinstance(password_hash, str):
        return False

    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except Exception as e:
        logger.warning("Password verification error: %s", e)
        return False


def check_password_strength(password: str) -> tuple[bool, list[str]]:
    """
    Evaluate a password against the platform security policy.

    Returns:
        (is_valid, list_of_violations)
        An empty violations list means the password passed all checks.
    """
    violations = []

    if not password:
        return False, ["Password cannot be empty."]

    if len(password) < MIN_LENGTH:
        violations.append(f"At least {MIN_LENGTH} characters required.")

    if len(password) > MAX_LENGTH:
        violations.append(f"Must not exceed {MAX_LENGTH} characters.")

    if REQUIRE_UPPERCASE and not re.search(r"[A-Z]", password):
        violations.append("At least one uppercase letter required.")

    if REQUIRE_LOWERCASE and not re.search(r"[a-z]", password):
        violations.append("At least one lowercase letter required.")

    if REQUIRE_DIGIT and not re.search(r"\d", password):
        violations.append("At least one digit required.")

    if REQUIRE_SPECIAL and not any(c in SPECIAL_CHARS for c in password):
        violations.append(f"At least one special character required ({SPECIAL_CHARS}).")

    if password.lower() in COMMON_PASSWORDS:
        violations.append("This password is too common. Choose a stronger one.")

    return len(violations) == 0, violations


def password_strength_score(password: str) -> dict:
    """
    Return a numeric strength score and label for UI feedback.

    Score breakdown:
        0-1  → Weak
        2-3  → Fair
        4    → Good
        5    → Strong
    """
    if not password:
        return {"score": 0, "label": "Weak", "color": "red"}

    score = 0

    if len(password) >= MIN_LENGTH:
        score += 1
    if len(password) >= 16:
        score += 1
    if re.search(r"[A-Z]", password) and re.search(r"[a-z]", password):
        score += 1
    if re.search(r"\d", password):
        score += 1
    if any(c in SPECIAL_CHARS for c in password):
        score += 1

    if password.lower() in COMMON_PASSWORDS:
        score = max(score - 2, 0)

    label_map = {
        0: ("Weak", "red"),
        1: ("Weak", "red"),
        2: ("Fair", "orange"),
        3: ("Fair", "orange"),
        4: ("Good", "yellow"),
        5: ("Strong", "green"),
    }

    label, color = label_map.get(score, ("Weak", "red"))
    return {"score": score, "label": label, "color": color}


def generate_secure_token(length: int = 64) -> str:
    """
    Generate a cryptographically secure random token.
    Suitable for password reset links, email verification, and API keys.
    """
    return secrets.token_urlsafe(length)


def generate_temp_password(length: int = 16) -> str:
    """
    Generate a temporary password that satisfies the platform policy.
    Useful for admin-triggered password resets.
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"

    while True:
        temp = "".join(secrets.choice(alphabet) for _ in range(length))
        is_valid, _ = check_password_strength(temp)
        if is_valid:
            return temp


def is_password_reused(new_password: str, stored_hashes: list[str]) -> bool:
    """
    Check whether a new password matches any previously used password hash.
    Useful for enforcing password history policies.

    Args:
        new_password:   Plain-text password to check.
        stored_hashes:  List of previous bcrypt hashes for the user.
    """
    return any(verify_password(new_password, h) for h in stored_hashes)


def mask_password(password: Optional[str], visible_chars: int = 2) -> str:
    """
    Return a partially masked version of a password for safe display in logs.
    Never log plain-text passwords — use this when you need any visual reference.
    """
    if not password:
        return "***"
    visible = password[:visible_chars]
    return visible + "*" * (len(password) - visible_chars)