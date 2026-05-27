"""
app/utils/token_utils.py - JWT token generation and verification utilities.
Tokens are signed with HS256 algorithm using the JWT_SECRET_KEY from .env.
"""

import os
import jwt
from datetime import datetime, timedelta, timezone


# Retrieve the JWT secret from environment variables
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "fallback-jwt-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 2  # Token expires after 2 hours


def generate_token(user_id: int, email: str, role: str) -> str:
    """
    Generates a signed JWT token containing user identity and role claims.

    Args:
        user_id (int): The user's database ID.
        email (str): The user's email address.
        role (str): The user's role ('user' or 'admin').

    Returns:
        str: A signed JWT token string.
    """
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "iat": datetime.now(timezone.utc),                            # Issued at
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)  # Expiry
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_token(token: str) -> dict | None:
    """
    Decodes and verifies a JWT token.
    Returns the decoded payload if valid, or None if invalid/expired.

    Args:
        token (str): The JWT token string to verify.

    Returns:
        dict | None: Decoded payload dictionary or None on failure.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token signature is invalid or malformed
        return None
