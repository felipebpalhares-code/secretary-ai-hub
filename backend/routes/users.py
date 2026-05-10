"""
Sprint H — gestão de usuários (admin-only).

Todas as rotas exigem ADMIN via Depends(require_role(UserRole.ADMIN)).
"""
from __future__ import annotations
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.dependencies import require_role
from models.user import User, UserRole
from schemas.user import (
    TemporaryPasswordResponse,
    UserCreate,
    UserCreatedResponse,
    UserResponse,
    UserUpdate,
)
from services import user_service
from services.database import get_session


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserResponse])
def list_users(
    _: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_session),
):
    return user_service.list_users(db)


@router.post("", response_model=UserCreatedResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    _: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_session),
):
    try:
        user, plaintext = user_service.create_user(
            db,
            email=payload.email,
            name=payload.name,
            role=payload.role,
            permissions=payload.permissions,
        )
    except user_service.UserServiceError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return {"user": user, "temporary_password": plaintext}


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    _: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_session),
):
    user = user_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    try:
        return user_service.update_user(
            db,
            user,
            name=payload.name,
            role=payload.role,
            permissions=payload.permissions,
            is_active=payload.is_active,
        )
    except user_service.UserServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{user_id}/reset-password", response_model=TemporaryPasswordResponse)
def reset_user_password(
    user_id: int,
    _: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_session),
):
    user = user_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    plaintext = user_service.reset_password(db, user)
    return {"temporary_password": plaintext}


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    _: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_session),
):
    user = user_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    try:
        user_service.soft_delete_user(db, user)
    except user_service.UserServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    from fastapi import Response
    return Response(status_code=status.HTTP_204_NO_CONTENT)
