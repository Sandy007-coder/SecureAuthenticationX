"""
app/utils/password_utils.py - Password hashing and verification using bcrypt.
Bcrypt automatically handles salting and work factor management.
"""

import bcrypt


def hash_password(plain_password: str) -> str:
    """
    Hashes a plain-text password using bcrypt with an auto-generated salt.

    Args:
        plain_password (str): The raw password string from the user.

    Returns:
        str: The bcrypt-hashed password as a UTF-8 decoded string.
    """
    # Generate a salt and hash the password
    # bcrypt.gensalt() uses a default work factor of 12
    password_bytes = plain_password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.

    Args:
        plain_password (str): The raw password input from the login attempt.
        hashed_password (str): The stored bcrypt hash from the database.

    Returns:
        bool: True if the password matches, False otherwise.
    """
    try:
        password_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        # Return False on any error to prevent information leakage
        return False
