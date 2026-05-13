from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from app.models.project import Project
from app.models.user import User
from app.models.project_member import ProjectMember
from app.models.project_specialty import ProjectSpecialty
from app.schemas.project import ProjectCreate, ProjectUpdate
from typing import Optional, List

class ProjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, data: ProjectCreate, owner_id: int) -> Project:
        """Создать проект"""
        project = Project(
            name=data.name,
            description=data.description,
            owner_id=owner_id
        )
        self.db.add(project)
        await self.db.commit()
        await self.db.refresh(project)
        return project
    
    async def get_by_id(self, project_id: int) -> Optional[Project]:
        """Получить проект по ID (с загрузкой участников)"""
        stmt = (
            select(Project)
            .where(and_(
                Project.id == project_id,
                Project.is_active == True
            ))
            .options(
                selectinload(Project.members).selectinload(ProjectMember.member),
                selectinload(Project.members).selectinload(ProjectMember.specialty)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_user_projects(self, user_id: int) -> List[Project]:
        """Все проекты, где состоит пользователь"""
        owned_stmt = select(Project).where(
            and_(
                Project.owner_id == user_id,
                Project.is_active == True
            )
        )
        owned_result = await self.db.execute(owned_stmt)
        owned = owned_result.scalars().all()
        
        member_stmt = (
            select(Project)
            .join(ProjectMember, Project.id == ProjectMember.project_id)
            .where(
                and_(
                    ProjectMember.user_id == user_id,
                    Project.is_active == True
                )
            )
        )
        member_result = await self.db.execute(member_stmt)
        member_of = member_result.scalars().all()
        
        seen = set()
        result = []
        for project in owned + member_of:
            if project.id not in seen:
                seen.add(project.id)
                result.append(project)
        
        return result
    
    async def update(self, project_id: int, data: ProjectUpdate) -> Optional[Project]:
        """Обновить проект"""
        stmt = select(Project).where(Project.id == project_id)
        result = await self.db.execute(stmt)
        project = result.scalar_one_or_none()
        
        if not project:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
        
        await self.db.commit()
        await self.db.refresh(project)
        return project
    
    async def delete(self, project_id: int) -> bool:
        """Удаление"""
        stmt = select(Project).where(Project.id == project_id)
        result = await self.db.execute(stmt)
        project = result.scalar_one_or_none()
        
        if not project:
            return False
        
        project.is_active = False
        await self.db.commit()
        return True
    
    async def get_members_with_specialties(self, project_id: int):
        """Получить участников проекта с информацией о специальностях"""
        stmt = (
            select(
                User.id,
                User.username,
                User.email,
                ProjectMember.specialty_id,
                ProjectSpecialty.name.label('specialty_name'),
                ProjectSpecialty.hex_color.label('specialty_hex_color')
            )
            .join(ProjectMember, User.id == ProjectMember.user_id)
            .outerjoin(ProjectSpecialty, ProjectMember.specialty_id == ProjectSpecialty.id)
            .where(ProjectMember.project_id == project_id)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        
        return [
            {
                "id": row.id,
                "username": row.username,
                "email": row.email,
                "specialty_id": row.specialty_id,
                "specialty_name": row.specialty_name,
                "specialty_hex_color": row.specialty_hex_color
            }
            for row in rows
        ]