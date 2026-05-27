"""
app/utils/validators.py - Input validation functions.
Validates username, email, and password strength to enforce security standards.
"""

import re


def validate_username(username: str) -> tuple[bool, str]:
    """
    Validates the username format.
    Rules:
    - Length between 3 and 30 characters
    - Only alphanumeric characters and underscores allowed
    - Cannot start or end with an underscore

    Args:
        username (str): The username string to validate.

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if not username or not isinstance(username, str):
        return False, "Username is required."

    username = username.strip()

    if len(username) < 3:
        return False, "Username must be at least 3 characters long."

    if len(username) > 30:
        return False, "Username must not exceed 30 characters."

    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False, "Username can only contain letters, numbers, and underscores."

    if username.startswith("_") or username.endswith("_"):
        return False, "Username cannot start or end with an underscore."

    return True, ""


def validate_email(email: str) -> tuple[bool, str]:
    """
    Validates the email address format using a standard regex pattern.

    Args:
        email (str): The email string to validate.

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if not email or not isinstance(email, str):
        return False, "Email is required."

    email = email.strip().lower()

    # Standard email format regex
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w{2,}$"

    if not re.match(pattern, email):
        return False, "Invalid email format."

    if len(email) > 255:
        return False, "Email address is too long."

    return True, ""


def validate_password(password: str) -> tuple[bool, str]:
    """
    Validates password strength.
    Rules:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character

    Args:
        password (str): The password string to validate.

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    if not password or not isinstance(password, str):
        return False, "Password is required."

    if len(password) < 8:
        return False, "Password must be at least 8 characters long."

    if len(password) > 128:
        return False, "Password must not exceed 128 characters."

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."

    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."

    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit."

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-\\\/\[\]+=~`';]", password):
        return False, "Password must contain at least one special character."

    return True, ""
