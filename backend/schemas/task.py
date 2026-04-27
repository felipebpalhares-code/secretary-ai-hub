from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ColumnIn(BaseModel):
    title: str
    color: Optional[str] = None
    is_done_column: bool = False


class ColumnPatch(BaseModel):
    title: Optional[str] = None
    color: Optional[str] = None
    is_done_column: Optional[bool] = None


class ColumnOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    color: Optional[str] = None
    order: int
    is_done_column: bool


class TaskIn(BaseModel):
    column_id: str
    title: str
    description: Optional[str] = None
    priority: Optional[str] = None  # "low" | "medium" | "high"
    due_date: Optional[datetime] = None
    due_time: bool = False
    tags: List[str] = []


class TaskPatch(BaseModel):
    column_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    due_time: Optional[bool] = None
    tags: Optional[List[str]] = None


class TaskOut(BaseModel):
    id: str
    column_id: str
    title: str
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    due_time: bool
    tags: List[str]
    order: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class TaskMove(BaseModel):
    column_id: str
    order: int


class ReorderIn(BaseModel):
    ids: List[str]
