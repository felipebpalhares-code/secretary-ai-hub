"""
Tasks Kanban — colunas e tarefas.
IDs são UUID (string hex). Diferente do resto do sistema que usa Integer auto-increment;
a escolha é local desta feature pra evitar colisão e simplificar IDs públicos.
"""
from __future__ import annotations
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from models.profile import Base


def _uuid_hex() -> str:
    return uuid.uuid4().hex


class TaskColumn(Base):
    __tablename__ = "task_columns"

    id              = Column(String, primary_key=True, default=_uuid_hex)
    title           = Column(String, nullable=False)
    color           = Column(String)            # ex: "#6366f1"
    order           = Column(Integer, default=0, nullable=False)
    is_done_column  = Column(Boolean, default=False, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    tasks = relationship(
        "Task",
        back_populates="column",
        cascade="all, delete-orphan",
        order_by="Task.order",
    )


class Task(Base):
    __tablename__ = "tasks"

    id            = Column(String, primary_key=True, default=_uuid_hex)
    column_id     = Column(String, ForeignKey("task_columns.id"), nullable=False)
    title         = Column(String, nullable=False)
    description   = Column(Text)                 # markdown opcional
    priority      = Column(String)               # "low" | "medium" | "high" | None
    due_date      = Column(DateTime)
    due_time      = Column(Boolean, default=False, nullable=False)
    tags_json     = Column(Text, default="[]", nullable=False)  # lista serializada
    order         = Column(Integer, default=0, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at  = Column(DateTime)

    column = relationship("TaskColumn", back_populates="tasks")
