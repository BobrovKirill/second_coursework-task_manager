from datetime import date, datetime
from enum import Enum
from typing import Optional

from humps import camelize
from pydantic import BaseModel, ConfigDict, Field


class TaskStatus(str, Enum):
    backlog = "backlog"
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: str = Field(default=TaskStatus.backlog.value, min_length=1, max_length=50)
    priority: int = Field(default=3, ge=1, le=5)
    task_type: Optional[str] = Field(default=None, max_length=50)
    deadline: Optional[date] = None
    assignee_id: Optional[int] = None

    model_config = ConfigDict(
        extra="forbid",
        alias_generator=camelize,
        populate_by_name=True,
    )


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[str] = Field(default=None, min_length=1, max_length=50)
    priority: Optional[int] = Field(default=None, ge=1, le=5)
    task_type: Optional[str] = Field(default=None, max_length=50)
    deadline: Optional[date] = None
    assignee_id: Optional[int] = None

    model_config = ConfigDict(
        extra="forbid",
        alias_generator=camelize,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "status": "in_progress",
                "priority": 4
            }
        }
    )


class TaskRead(TaskBase):
    id: int
    project_id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        alias_generator=camelize,
        populate_by_name=True,
        from_attributes=True,
    )