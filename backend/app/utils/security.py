from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, UTC
import os
from dotenv import load_dotenv
from jose import JWTError

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise RuntimeError("SECRET_KEY environment variable is not configured or is too weak (must be at least 32 characters long)!")

import bcrypt

def hash_password(password: str) -> str:
    pw_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pw_bytes, hash_bytes)

def create_access_token(data: dict):
    to_encode = data.copy()
    now = datetime.now(UTC)
    expire = now + timedelta(hours=1)

    to_encode.update({
        "exp": expire,
        "iat": now,
        "sub": str(data.get("user_id")),
        "type": "access"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        # Verify claims
        if payload.get("type") != "access":
            return None
        if not payload.get("sub"):
            return None
        return payload

    except JWTError:
        return None