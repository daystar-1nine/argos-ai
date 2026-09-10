"""
ARGOS AI - Security, Cryptography & Authentication Primitives
Implements direct bcrypt password hashing and JWT token generation/verification.
"""

import bcrypt
import hashlib
import secrets
import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
import jwt
from app.core.config import settings


# In-memory sliding window rate limiter for failed login attempts
# key: identifier (IP or email) -> list of failed timestamp floats
_FAILED_LOGINS: Dict[str, List[float]] = defaultdict(list)


def get_password_hash(password: str) -> str:
    """Hashes a password with bcrypt salt, truncating to 72 bytes max."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates signed JWT token with expiration timestamp."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp()), "iat": int(now.timestamp())})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token signature and expiration."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None


def create_refresh_token() -> str:
    """Generates a high-entropy cryptographically secure refresh token."""
    return secrets.token_urlsafe(64)


def hash_token(token: str) -> str:
    """Hashes a token with SHA-256 for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_ip(ip: Optional[str]) -> Optional[str]:
    """Generates a pseudonymous SHA-256 hash of an IP address for privacy."""
    if not ip:
        return None
    return hashlib.sha256(f"argos_{ip}".encode("utf-8")).hexdigest()[:32]


def check_login_rate_limit(identifier: str) -> bool:
    """
    Checks whether the given identifier (IP or email) is allowed to attempt login.
    Returns True if allowed, False if rate limited.
    """
    now = time.time()
    window = settings.LOGIN_RATE_LIMIT_WINDOW_SEC
    max_attempts = settings.LOGIN_RATE_LIMIT_ATTEMPTS

    # Prune expired entries
    attempts = [t for t in _FAILED_LOGINS[identifier] if now - t < window]
    _FAILED_LOGINS[identifier] = attempts

    return len(attempts) < max_attempts


def record_failed_login(identifier: str) -> int:
    """Records a failed login attempt and returns the current count within the window."""
    now = time.time()
    _FAILED_LOGINS[identifier].append(now)
    # Prune
    window = settings.LOGIN_RATE_LIMIT_WINDOW_SEC
    _FAILED_LOGINS[identifier] = [t for t in _FAILED_LOGINS[identifier] if now - t < window]
    return len(_FAILED_LOGINS[identifier])


def reset_login_rate_limit(identifier: str) -> None:
    """Resets failed login attempts for an identifier upon successful authentication."""
    if identifier in _FAILED_LOGINS:
        del _FAILED_LOGINS[identifier]

