from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.task import TaskRead, TaskUpdate, UserTaskRead
from app.services.task_service import TaskService
from app.schemas.comment import CommentCreate, CommentRead
from app.services.comment_service import CommentService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


async def get_task_service(db: AsyncSession = Depends(get_db)):
    return TaskService(db)

async def get_comment_service(db: AsyncSession = Depends(get_db)):
    return CommentService(db)

@router.get("/me", response_model=List[UserTaskRead])
async def get_my_tasks(
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    return await service.get_user_tasks(current_user.id)


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    return await service.get_task(task_id, current_user.id)


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    return await service.update_task(task_id, data, current_user.id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    await service.delete_task(task_id, current_user.id)

@router.get("/{task_id}/comments", response_model=List[CommentRead])
async def get_task_comments(
    task_id: int,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user),
):
    """Получить комментарии задачи"""
    return await service.get_task_comments(task_id, current_user.id)


@router.post("/{task_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_task_comment(
    task_id: int,
    data: CommentCreate,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user),
):
    """Создать комментарий к задаче"""
    return await service.create_comment(task_id, data, current_user.id)