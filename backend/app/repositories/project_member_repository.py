from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from sqlalchemy.orm import selectinload
from app.models.project_member import ProjectMember, ProjectMemberRole
from app.models.role import Role
from app.models.user import User
from typing import List, Optional

class ProjectMemberRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def add_member(self, project_id: int, user_id: int) -> Optional[ProjectMember]:
        """Добавить участника в проект"""
        stmt = select(ProjectMember).where(
            and_(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id
            )
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            return existing
        
        member = ProjectMember(project_id=project_id, user_id=user_id)
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(member)
        return member
    
    async def remove_member(self, project_id: int, user_id: int) -> bool:
        """Удалить участника из проекта"""
        stmt = delete(ProjectMember).where(
            and_(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id
            )
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0
    
    async def get_project_members(self, project_id: int) -> List[ProjectMember]:
        """Получить всех участников проекта"""
        stmt = (
            select(ProjectMember)
            .where(ProjectMember.project_id == project_id)
            .options(
                selectinload(ProjectMember.member),
                selectinload(ProjectMember.specialty)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def is_member(self, project_id: int, user_id: int) -> bool:
        """Проверить, является ли пользователь участником"""
        stmt = select(ProjectMember).where(
            and_(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None
    
    async def get_member_role_name(self, project_id: int, user_id: int) -> Optional[str]:
        """Получить название роли пользователя в проекте"""
        stmt = (
            select(Role.name)
            .join(ProjectMemberRole, ProjectMemberRole.role_id == Role.id)
            .where(
                and_(
                    ProjectMemberRole.project_id == project_id,
                    ProjectMemberRole.user_id == user_id
                )
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()