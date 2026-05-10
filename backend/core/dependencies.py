"""
Sprint H — FastAPI dependencies para autenticação e autorização.
"""
from __future__ import annotations
from typing import Callable, Iterable

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from core.security import COOKIE_NAME, decode_access_token
from models.user import User, UserRole, has_permission
from services.database import get_session


def _unauthorized(detail: str = "Não autenticado") -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _forbidden(detail: str = "Sem permissão") -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def get_current_user(
    request: Request,
    db: Session = Depends(get_session),
) -> User:
    """
    Resolve o usuário a partir do cookie httpOnly access_token. Lança 401 em
    qualquer falha (ausente, inválido, expirado, user inativo, user removido).
    """
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise _unauthorized()

    payload = decode_access_token(token)
    if not payload:
        raise _unauthorized("Sessão inválida ou expirada")

    raw_sub = payload.get("sub")
    try:
        user_id = int(raw_sub) if raw_sub is not None else None
    except (TypeError, ValueError):
        user_id = None
    if user_id is None:
        raise _unauthorized("Token malformado")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise _unauthorized("Usuário não encontrado ou inativo")
    return user


def require_role(*roles: UserRole) -> Callable[..., User]:
    """
    Factory de dependency: aceita apenas users com role na lista informada.
    Uso: `Depends(require_role(UserRole.ADMIN))`.
    """
    allowed: Iterable[UserRole] = tuple(roles)

    def _checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise _forbidden(f"Restrito a: {', '.join(r.value for r in allowed)}")
        return user

    return _checker


def require_permission(module: str, action: str) -> Callable[..., User]:
    """
    Factory de dependency: ADMIN passa direto; ASSISTANT passa apenas se
    permissions[module][action] for True. Módulos `usuarios` e `configuracoes`
    são sempre admin-only — vide ADMIN_ONLY_MODULES.
    """
    def _checker(user: User = Depends(get_current_user)) -> User:
        if not has_permission(user, module, action):
            raise _forbidden(f"Sem permissão: {module}:{action}")
        return user

    return _checker
