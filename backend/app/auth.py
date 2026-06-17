from __future__ import annotations
import hashlib
import hmac
import os
import base64
import json
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .config import settings
from .db import User, get_session


# --- password hashing (PBKDF2; stdlib only, no extra deps) --------------------

_ITER = 120_000
_SALT_BYTES = 16


def hash_password(plain: str) -> str:
    salt = os.urandom(_SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, _ITER)
    return f"pbkdf2_sha256${_ITER}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def verify_password(plain: str, stored: str) -> bool:
    try:
        algo, iters, salt_b64, hash_b64 = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, int(iters))
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


# --- JWT (HS256, stdlib only) -------------------------------------------------

def _b64url(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def _b64url_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def create_access_token(subject: str, extra: Optional[dict] = None) -> str:
    header = {"alg": settings.jwt_algorithm, "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + settings.jwt_expire_minutes * 60,
    }
    if extra:
        payload.update(extra)
    h = _b64url(json.dumps(header, separators=(",", ":")).encode())
    p = _b64url(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{h}.{p}".encode()
    import hashlib as _h
    sig = _h.new(settings.jwt_algorithm.replace("HS", "sha"), settings.jwt_secret.encode(), digestmod=_h).digest() \
        if False else hmac.new(settings.jwt_secret.encode(), signing_input, _h.sha256).digest()
    return f"{h}.{p}.{_b64url(sig)}"


def decode_token(token: str) -> dict:
    try:
        h, p, s = token.split(".")
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token format")
    signing_input = f"{h}.{p}".encode()
    expected = hmac.new(settings.jwt_secret.encode(), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url(expected), s):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token signature")
    try:
        payload = json.loads(_b64url_decode(p))
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token payload")
    if payload.get("exp", 0) < int(time.time()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    return payload


# --- FastAPI bits -------------------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class MeResponse(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str


router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_session),
) -> User:
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    payload = decode_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token subject")
    user = db.query(User).filter_by(username=username, is_active=True).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user


def require_role(*roles: str):
    def _check(user: User = Depends(get_current_user)) -> User:
        if roles and user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient role")
        return user
    return _check


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_session)) -> LoginResponse:
    user = db.query(User).filter_by(username=req.username, is_active=True).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    token = create_access_token(user.username, {"role": user.role, "name": user.full_name})
    return LoginResponse(
        access_token=token,
        user={"username": user.username, "full_name": user.full_name, "role": user.role},
    )


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(username=user.username, full_name=user.full_name, role=user.role)


def seed_default_users(db: Session) -> None:
    """Seed default workers on first startup if no users exist."""
    if db.query(User).count() > 0:
        return
    for w in settings.seed_workers:
        db.add(User(
            username=w["username"],
            password_hash=hash_password(w["password"]),
            full_name=w.get("full_name"),
            role=w.get("role", "clinician"),
        ))
    db.commit()
