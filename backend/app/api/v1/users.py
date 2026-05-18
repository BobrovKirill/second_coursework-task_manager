from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_current_user
from app.core.permissions import get_user_permissions
from app.models import ProjectMemberRole, Role
from app.models.user import User
from app.core.database import get_db
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    """Dependency для получения UserService"""
    repository = UserRepository(db)
    return UserService(repository)


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    """Создание нового пользователя"""
    return await service.create_user(user_data)

@router.get("/me", response_model=UserRead)
async def get_me(
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = UserRead.model_validate(current_user)

    if project_id:
        role_result = await db.execute(
            select(ProjectMemberRole).where(
                ProjectMemberRole.project_id == project_id,
                ProjectMemberRole.user_id == current_user.id
            )
        )
        member_role = role_result.scalar_one_or_none()
        if member_role:
            role_name_result = await db.execute(
                select(Role.name).where(Role.id == member_role.role_id)
            )
            result.role = role_name_result.scalar_one_or_none()

        result.permissions = await get_user_permissions(project_id, current_user.id, db)

    return result


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """Получение пользователя по ID"""
    return await service.get_user(user_id)


@router.get("/", response_model=list[UserRead])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    service: UserService = Depends(get_user_service)
):
    """Получение списка пользователей"""
    return await service.get_users(skip=skip, limit=limit)


@router.patch("/me", response_model=UserRead)
async def update_user(
        user_data: UserUpdate,
        project_id: Optional[int] = None,
        current_user: User = Depends(get_current_user),
        service: UserService = Depends(get_user_service),
        db: AsyncSession = Depends(get_db)
):

    updated_user = await service.update_user(current_user.id, user_data)

    result = UserRead.model_validate(updated_user)

    if project_id:
        role_result = await db.execute(
            select(ProjectMemberRole).where(
                ProjectMemberRole.project_id == project_id,
                ProjectMemberRole.user_id == current_user.id
            )
        )
        member_role = role_result.scalar_one_or_none()

        if member_role:
            role_name_result = await db.execute(
                select(Role.name).where(Role.id == member_role.role_id)
            )
            result.role = role_name_result.scalar_one_or_none()

        result.permissions = await get_user_permissions(project_id, current_user.id, db)

    return result


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    """Удаление пользователя"""
    await service.delete_user(user_id)
