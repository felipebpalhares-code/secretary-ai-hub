"""
Tasks Kanban — rotas REST.
"""
from __future__ import annotations
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.task import Task, TaskColumn
from schemas.task import (
    ColumnIn, ColumnOut, ColumnPatch,
    TaskIn, TaskOut, TaskPatch, TaskMove,
    ReorderIn,
)
from services.database import get_session

router = APIRouter(prefix="/api", tags=["tasks"])


# ───────── helpers ─────────

def _task_to_out(t: Task) -> TaskOut:
    try:
        tags = json.loads(t.tags_json or "[]")
        if not isinstance(tags, list):
            tags = []
    except json.JSONDecodeError:
        tags = []
    return TaskOut(
        id=t.id,
        column_id=t.column_id,
        title=t.title,
        description=t.description,
        priority=t.priority,
        due_date=t.due_date,
        due_time=bool(t.due_time),
        tags=tags,
        order=t.order,
        created_at=t.created_at,
        updated_at=t.updated_at,
        completed_at=t.completed_at,
    )


def _seed_default_columns(db: Session) -> list[TaskColumn]:
    cols = [
        TaskColumn(title="A Fazer", order=0, is_done_column=False),
        TaskColumn(title="Em Andamento", order=1, is_done_column=False),
        TaskColumn(title="Concluído", order=2, is_done_column=True),
    ]
    for c in cols:
        db.add(c)
    db.commit()
    for c in cols:
        db.refresh(c)
    return cols


def _next_task_order(db: Session, column_id: str) -> int:
    max_order = (
        db.query(func.max(Task.order)).filter(Task.column_id == column_id).scalar()
    )
    return (max_order or -1) + 1


def _next_column_order(db: Session) -> int:
    max_order = db.query(func.max(TaskColumn.order)).scalar()
    return (max_order or -1) + 1


# ═════════════ COLUMNS ═════════════

@router.get("/task-columns", response_model=list[ColumnOut])
def list_columns(db: Session = Depends(get_session)):
    cols = db.query(TaskColumn).order_by(TaskColumn.order, TaskColumn.created_at).all()
    if not cols:
        cols = _seed_default_columns(db)
    return cols


@router.post("/task-columns", response_model=ColumnOut, status_code=201)
def create_column(payload: ColumnIn, db: Session = Depends(get_session)):
    col = TaskColumn(
        title=payload.title.strip() or "Sem título",
        color=payload.color,
        is_done_column=payload.is_done_column,
        order=_next_column_order(db),
    )
    db.add(col); db.commit(); db.refresh(col)
    return col


@router.put("/task-columns/{cid}", response_model=ColumnOut)
def update_column(cid: str, payload: ColumnPatch, db: Session = Depends(get_session)):
    col = db.get(TaskColumn, cid)
    if not col:
        raise HTTPException(404, "Coluna não encontrada")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(col, k, v)
    db.commit(); db.refresh(col)
    return col


@router.delete("/task-columns/{cid}")
def delete_column(cid: str, db: Session = Depends(get_session)):
    col = db.get(TaskColumn, cid)
    if not col:
        raise HTTPException(404, "Coluna não encontrada")
    others = (
        db.query(TaskColumn)
        .filter(TaskColumn.id != cid)
        .order_by(TaskColumn.order)
        .all()
    )
    if not others:
        raise HTTPException(400, "Não é possível apagar a única coluna")

    target = others[0]
    # Move tasks pra primeira coluna restante (preservando ordem)
    base_order = _next_task_order(db, target.id)
    tasks_to_move = (
        db.query(Task).filter(Task.column_id == cid).order_by(Task.order).all()
    )
    for i, t in enumerate(tasks_to_move):
        t.column_id = target.id
        t.order = base_order + i
    db.delete(col)
    db.commit()
    return {"ok": True, "moved_to": target.id, "moved_count": len(tasks_to_move)}


@router.post("/task-columns/reorder")
def reorder_columns(payload: ReorderIn, db: Session = Depends(get_session)):
    cols = {c.id: c for c in db.query(TaskColumn).all()}
    for idx, cid in enumerate(payload.ids):
        col = cols.get(cid)
        if col is not None:
            col.order = idx
    db.commit()
    return {"ok": True}


# ═════════════ TASKS ═════════════

@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(
    column_id: Optional[str] = Query(default=None),
    due: Optional[str] = Query(default=None, description="today | overdue | none"),
    db: Session = Depends(get_session),
):
    q = db.query(Task)
    if column_id:
        q = q.filter(Task.column_id == column_id)
    if due == "today":
        from datetime import date
        today = date.today()
        q = q.filter(func.date(Task.due_date) == today)
    elif due == "overdue":
        q = q.filter(Task.due_date != None).filter(Task.due_date < datetime.utcnow())  # noqa: E711
    elif due == "none":
        q = q.filter(Task.due_date == None)  # noqa: E711
    rows = q.order_by(Task.column_id, Task.order).all()
    return [_task_to_out(t) for t in rows]


@router.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(payload: TaskIn, db: Session = Depends(get_session)):
    col = db.get(TaskColumn, payload.column_id)
    if not col:
        raise HTTPException(400, "column_id não existe")
    t = Task(
        column_id=payload.column_id,
        title=payload.title.strip() or "Sem título",
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
        due_time=payload.due_time,
        tags_json=json.dumps(payload.tags or [], ensure_ascii=False),
        order=_next_task_order(db, payload.column_id),
    )
    if col.is_done_column:
        t.completed_at = datetime.utcnow()
    db.add(t); db.commit(); db.refresh(t)
    return _task_to_out(t)


@router.put("/tasks/{tid}", response_model=TaskOut)
def update_task(tid: str, payload: TaskPatch, db: Session = Depends(get_session)):
    t = db.get(Task, tid)
    if not t:
        raise HTTPException(404, "Tarefa não encontrada")
    data = payload.model_dump(exclude_unset=True)
    if "tags" in data:
        t.tags_json = json.dumps(data.pop("tags") or [], ensure_ascii=False)
    if "column_id" in data and data["column_id"] != t.column_id:
        col = db.get(TaskColumn, data["column_id"])
        if not col:
            raise HTTPException(400, "column_id não existe")
        t.completed_at = datetime.utcnow() if col.is_done_column else None
    for k, v in data.items():
        setattr(t, k, v)
    db.commit(); db.refresh(t)
    return _task_to_out(t)


@router.delete("/tasks/{tid}")
def delete_task(tid: str, db: Session = Depends(get_session)):
    t = db.get(Task, tid)
    if not t:
        raise HTTPException(404, "Tarefa não encontrada")
    db.delete(t); db.commit()
    return {"ok": True}


@router.post("/tasks/{tid}/move", response_model=TaskOut)
def move_task(tid: str, payload: TaskMove, db: Session = Depends(get_session)):
    t = db.get(Task, tid)
    if not t:
        raise HTTPException(404, "Tarefa não encontrada")
    col = db.get(TaskColumn, payload.column_id)
    if not col:
        raise HTTPException(400, "column_id não existe")

    same_column = t.column_id == payload.column_id
    target_index = max(0, payload.order)

    siblings = (
        db.query(Task)
        .filter(Task.column_id == payload.column_id)
        .filter(Task.id != tid)
        .order_by(Task.order)
        .all()
    )
    target_index = min(target_index, len(siblings))
    siblings.insert(target_index, t)
    for i, s in enumerate(siblings):
        s.order = i

    if not same_column:
        t.column_id = payload.column_id
        t.completed_at = datetime.utcnow() if col.is_done_column else None

    db.commit(); db.refresh(t)
    return _task_to_out(t)


@router.post("/tasks/reorder")
def reorder_tasks(payload: ReorderIn, db: Session = Depends(get_session)):
    rows = {t.id: t for t in db.query(Task).filter(Task.id.in_(payload.ids)).all()}
    for idx, tid in enumerate(payload.ids):
        t = rows.get(tid)
        if t is not None:
            t.order = idx
    db.commit()
    return {"ok": True}
