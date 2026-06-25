import os
import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt

logger = logging.getLogger(__name__)


JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET_KEY")
JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRY_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRY_MINUTES", 30))
REFRESH_TOKEN_EXPIRY_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRY_DAYS", 7))

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET_KEY environment variable is not set. "
        "Set it to a long random string before starting the server."
    )

if not JWT_REFRESH_SECRET:
    raise RuntimeError(
        "JWT_REFRESH_SECRET_KEY environment variable is not set. "
        "Set it to a long random string before starting the server."
    )


def generate_token(
    user_id: int,
    email: str,
    role: str,
    is_active: bool = True,
) -> str:
    """
    Issue a short-lived signed JWT access token.
    Expires in ACCESS_TOKEN_EXPIRY_MINUTES (default 30 minutes).
    """
    now = datetime.now(timezone.utc)

    claims = {
        "jti": str(uuid.uuid4()),
        "type": "access",
        "user_id": user_id,
        "email": email,
        "role": role,
        "is_active": is_active,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRY_MINUTES),
    }

    return jwt.encode(claims, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """
    Decode and validate an access token.
    Returns the payload dict on success, None on any failure.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        if payload.get("type") != "access":
            logger.warning("Token type mismatch — expected access token.")
            return None

        return payload

    except jwt.ExpiredSignatureError:
        logger.debug("Access token expired.")
        return None

    except jwt.InvalidTokenError as e:
        logger.warning("Invalid access token: %s", e)
        return None


def generate_refresh_token(user_id: int, email: str) -> str:
    """
    Issue a long-lived signed JWT refresh token.
    Expires in REFRESH_TOKEN_EXPIRY_DAYS (default 7 days).
    Signed with a separate secret so a leaked access secret
    cannot be used to forge refresh tokens.
    """
    now = datetime.now(timezone.utc)

    claims = {
        "jti": str(uuid.uuid4()),
        "type": "refresh",
        "user_id": user_id,
        "email": email,
        "iat": now,
        "exp": now + timedelta(days=REFRESH_TOKEN_EXPIRY_DAYS),
    }

    return jwt.encode(claims, JWT_REFRESH_SECRET, algorithm=JWT_ALGORITHM)


def verify_refresh_token(token: str) -> Optional[dict]:
    """
    Decode and validate a refresh token.
    Returns the payload dict on success, None on any failure.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_REFRESH_SECRET,
            algorithms=[JWT_ALGORITHM],
        )

        if payload.get("type") != "refresh":
            logger.warning("Token type mismatch — expected refresh token.")
            return None

        return payload

    except jwt.ExpiredSignatureError:
        logger.debug("Refresh token expired.")
        return None

    except jwt.InvalidTokenError as e:
        logger.warning("Invalid refresh token: %s", e)
        return None


def decode_token_unverified(token: str) -> Optional[dict]:
    """
    Decode a JWT without verifying the signature.
    Only used for reading metadata (e.g. expiry, user_id) from an
    already-authenticated context. Never use for authorization decisions.
    """
    try:
        return jwt.decode(
            token,
            options={"verify_signature": False},
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.InvalidTokenError:
        return None


def is_token_expired(token: str) -> bool:
    """
    Check whether a token has passed its expiry time without
    raising an exception. Useful for refresh flow decisions.
    """
    payload = decode_token_unverified(token)
    if not payload:
        return True

    exp = payload.get("exp")
    if not exp:
        return True

    return datetime.now(timezone.utc) > datetime.fromtimestamp(exp, tz=timezone.utc)


def get_token_remaining_seconds(token: str) -> int:
    """
    Return the number of seconds until a token expires.
    Returns 0 if already expired or unreadable.
    """
    payload = decode_token_unverified(token)
    if not payload:
        return 0

    exp = payload.get("exp")
    if not exp:
        return 0

    remaining = datetime.fromtimestamp(exp, tz=timezone.utc) - datetime.now(timezone.utc)
    return max(int(remaining.total_seconds()), 0)


def build_token_response(access_token: str) -> dict:
    """
    Build a standardized token metadata response for the frontend.
    Attach this to login and refresh responses so the client knows
    exactly when to request a new token without guessing.
    """
    return {
        "token_type": "Bearer",
        "expires_in": get_token_remaining_seconds(access_token),
        "access_token_expiry_minutes": ACCESS_TOKEN_EXPIRY_MINUTES,
    }