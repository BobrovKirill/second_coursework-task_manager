from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.permissions import require_permission
from app.services.project_service import ProjectService
from app.core.deps import get_current_user
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, ProjectWithMembers, ProjectListItem
from app.models.user import User
from app.schemas.user import UserRead
from app.schemas.project_member import MemberRoleAssign
from app.schemas.task import TaskCreate, TaskRead
from app.services.task_service import TaskService

router = APIRouter(prefix="/projects", tags=["Projects"])

async def get_project_service(db: AsyncSession = Depends(get_db)):
    return ProjectService(db)

async def get_task_service(db: AsyncSession = Depends(get_db)):
    return TaskService(db)

@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_user)
):
    """Создать новый проект"""
    return await service.create_project(data, current_user.id)

@router.get("/", response_model=List[ProjectListItem])
async def get_my_projects(
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_user)
):
    """Получить список проектов текущего пользователя"""
    return await service.get_user_projects(current_user.id)

@router.post("/{project_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_project_task(
    project_id: int,
    data: TaskCreate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    """Создать задачу в проекте"""
    return await service.create_task(project_id, data, current_user.id)


@router.get("/{project_id}/tasks", response_model=List[TaskRead])
async def get_project_tasks(
    project_id: int,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user),
):
    """Получить задачи проекта"""
    return await service.get_project_tasks(project_id, current_user.id)

@router.get("/{project_id}", response_model=ProjectWithMembers)
async def get_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_user)
):
    """Получить информацию о проекте"""
    return await service.get_project(project_id, current_user.id)

@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: int,
    data: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(require_permission("delete_project"))
):
    """Обновить проект"""
    return await service.update_project(project_id, data, current_user.id)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(require_permission("delete_project"))
):
    """Удалить проект"""
    await service.delete_project(project_id, current_user.id)

@router.post("/{project_id}/members/{user_id}", response_model=UserRead)
async def add_member(
    project_id: int,
    user_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(require_permission("manage_members"))
):
    """Добавить участника в проект"""
    return await service.add_member(project_id, user_id, current_user.id)

@router.get("/{project_id}/members", response_model=List[UserRead])
async def get_members(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_user)
):
    """Получить список участников проекта"""
    return await service.get_project_members(project_id, current_user.id)

@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    project_id: int,
    user_id: int,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(require_permission("manage_members"))
):
    """Удалить участника из проекта"""
    await service.remove_member(project_id, user_id, current_user.id)

@router.put("/{project_id}/members/{user_id}/role", response_model=dict)
async def assign_role(
    project_id: int,
    user_id: int,
    data: MemberRoleAssign,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(require_permission("assign_role"))
):
    """Назначить роль участнику"""
    return await service.assign_role(project_id, user_id, data.role_name, current_user.id)