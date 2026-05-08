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
from app.services.board_column_service import BoardColumnService
from app.schemas.board_column import BoardColumnRead
from app.schemas.board_column import BoardColumnUpdate


router = APIRouter(prefix="/projects", tags=["Projects"])

async def get_project_service(db: AsyncSession = Depends(get_db)):
    return ProjectService(db)

async def get_column_service(db: AsyncSession = Depends(get_db)):
    return BoardColumnService(db)

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

@router.get("/{project_id}/columns", response_model=list[BoardColumnRead])
async def get_project_columns(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    column_service: BoardColumnService = Depends(get_column_service),
    current_user: User = Depends(get_current_user)
):
    """Получить все колонки проекта"""
    project = await service.get_project(project_id, current_user.id)
    
    return await column_service.get_project_columns(project_id)

@router.put("/{project_id}/columns/batch", response_model=List[BoardColumnRead])
async def update_project_columns_batch(
    project_id: int,
    columns_data: List[BoardColumnUpdate],
    service: ProjectService = Depends(get_project_service),
    column_service: BoardColumnService = Depends(get_column_service),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Пакетное обновление колонок проекта"""
    await service.get_project(project_id, current_user.id)
    
    current_columns = await column_service.get_project_columns(project_id)
    current_ids = {col.id for col in current_columns}
    
    update_ids = {col.id for col in columns_data if col.id and col.id in current_ids}
    
    for i, col in enumerate(current_columns):
        temp_data = BoardColumnUpdate(position=100 + i)
        await column_service.column_repo.update(col.id, temp_data)
    
    await db.flush()
    
    updated_columns = []
    new_ids = set()
    
    sorted_data = sorted(columns_data, key=lambda x: x.position if x.position is not None else 999)
    
    for col_data in sorted_data:
        if col_data.id and col_data.id in current_ids:
            update_data = BoardColumnUpdate(
                title=col_data.title,
                position=col_data.position
            )
            updated = await column_service.update_column(col_data.id, update_data)
            if updated:
                updated_columns.append(updated)
                new_ids.add(col_data.id)
        elif not col_data.id:
            from app.schemas.board_column import BoardColumnCreate
            new_column = BoardColumnCreate(
                project_id=project_id,
                title=col_data.title or "Новая колонка",
                position=col_data.position if col_data.position is not None else len(updated_columns)
            )
            created = await column_service.create_column(new_column)
            updated_columns.append(created)
            new_ids.add(created.id)
    
    for col_id in current_ids - new_ids:
        await column_service.delete_column(col_id)
    
    await db.commit()
    return updated_columns