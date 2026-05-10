"""
Sprint H — rotas de autenticação (/api/auth/*).
"""
from __future__ import annotations
import os

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from core.security import (
    COOKIE_NAME,
    JWT_DEFAULT_EXPIRES,
    create_access_token,
)
from models.user import User
from schemas.user import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from services import user_service
from services.database import get_session

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _cookie_kwargs() -> dict:
    """
    Atributos do cookie httpOnly. COOKIE_SECURE/COOKIE_DOMAIN configurados via
    env. Em dev (HTTP), COOKIE_SECURE=false. Em prod (HTTPS), true.
    """
    secure = os.getenv("COOKIE_SECURE", "false").lower() in {"1", "true", "yes"}
    domain = os.getenv("COOKIE_DOMAIN") or None
    kwargs = {
        "httponly": True,
        "secure": secure,
        "samesite": "lax",
        "path": "/",
        "max_age": int(JWT_DEFAULT_EXPIRES.total_seconds()),
    }
    if domain:
        kwargs["domain"] = domain
    return kwargs


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_session),
):
    user = user_service.validate_login(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
        )
    user_service.update_last_login(db, user)
    token = create_access_token(user_id=user.id, role=user.role.value)
    response.set_cookie(COOKIE_NAME, token, **_cookie_kwargs())
    return {"user": user}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    # delete_cookie respeita path e domain — passamos os mesmos atributos do set
    kwargs = _cookie_kwargs()
    response.delete_cookie(
        COOKIE_NAME,
        path=kwargs["path"],
        domain=kwargs.get("domain"),
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    try:
        user_service.change_password(
            db, user, payload.current_password, payload.new_password
        )
    except user_service.UserServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
