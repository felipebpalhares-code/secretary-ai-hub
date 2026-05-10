"""
Sprint H — CLI para resetar a senha de um admin (ou criar admin) via container.

Uso (dentro do container):
    python -m scripts.reset_admin_password admin@email.com novaSenha123

Comportamento:
  - Se o usuário não existe, cria como ADMIN com a senha informada.
  - Se existe, atualiza o hash da senha (mantém role/permissions).
  - Em ambos os casos, must_change_password = False (CLI é canal explícito).

NÃO usa env vars — espera email e senha como args. Não imprime a senha.
"""
from __future__ import annotations
import sys

from sqlalchemy.exc import SQLAlchemyError

from core.security import hash_password
from models.user import User, UserRole
from services.database import SessionLocal, init_db


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("Uso: python -m scripts.reset_admin_password <email> <nova_senha>", file=sys.stderr)
        return 2

    _, email, new_password = argv
    if len(new_password) < 12:
        print("Senha precisa ter pelo menos 12 caracteres.", file=sys.stderr)
        return 2

    init_db()  # garante schema + alembic up to date
    with SessionLocal() as db:
        try:
            user = db.query(User).filter(User.email == email).first()
            if user is None:
                user = User(
                    email=email,
                    name=email.split("@")[0],
                    hashed_password=hash_password(new_password),
                    role=UserRole.ADMIN,
                    permissions={},
                    is_active=True,
                    must_change_password=False,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"✓ Admin criado: {email} (id={user.id})")
                return 0

            user.hashed_password = hash_password(new_password)
            user.must_change_password = False
            user.is_active = True
            db.commit()
            print(f"✓ Senha atualizada para {email} (id={user.id}, role={user.role.value})")
            return 0
        except SQLAlchemyError as e:
            db.rollback()
            print(f"Erro de banco: {e}", file=sys.stderr)
            return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
