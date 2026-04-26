"""
Sessão SQLAlchemy compartilhada (SQLite local).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.profile import Base
import models.message_log  # noqa: F401  (garante registro da tabela no metadata)
import models.banking      # noqa: F401

# Em Docker, DATABASE_PATH=/data/felipe_hub.db (volume persistido).
# Local: cria felipe_hub.db na raiz do backend.
DATABASE_PATH = os.getenv("DATABASE_PATH", "./felipe_hub.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
