from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import ProjectMemberRole
from app.models.user import User
from app.models.role import RolePermission
from app.models.permission import Permission


# Получаем permissions пользователя в проекте
async def get_user_permissions(
    project_id: int,
    user_id: int,
    db: AsyncSession
) -> list[str]:
    result = await db.execute(
        select(Permission.name)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(ProjectMemberRole, ProjectMemberRole.role_id == RolePermission.role_id)
        .where(
            ProjectMemberRole.project_id == project_id,
            ProjectMemberRole.user_id == user_id
        )
    )
    return list(result.scalars().all())

# Проверка конкретного permission
def require_permission(permission_name: str):
    async def check_permission(
        project_id: int,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        permissions = await get_user_permissions(project_id, current_user.id, db)
        if permission_name not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Недостаточно прав: требуется {permission_name}"
            )
        return current_user
    return check_permission