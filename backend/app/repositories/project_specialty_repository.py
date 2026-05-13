from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from app.models.project_specialty import ProjectSpecialty
from app.schemas.project_specialty import ProjectSpecialtyCreate, ProjectSpecialtyUpdate
from typing import List, Optional

class ProjectSpecialtyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, project_id: int, data: ProjectSpecialtyCreate) -> ProjectSpecialty:
        """Создать специальность"""
        specialty = ProjectSpecialty(
            project_id=project_id,
            name=data.name,
            hex_color=data.hex_color
        )
        self.db.add(specialty)
        await self.db.commit()
        await self.db.refresh(specialty)
        return specialty
    
    async def get_by_id(self, specialty_id: int) -> Optional[ProjectSpecialty]:
        """Получить специальность по ID"""
        stmt = select(ProjectSpecialty).where(ProjectSpecialty.id == specialty_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_project_specialties(self, project_id: int) -> List[ProjectSpecialty]:
        """Получить все специальности проекта"""
        stmt = select(ProjectSpecialty).where(
            ProjectSpecialty.project_id == project_id
        ).order_by(ProjectSpecialty.id)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def update(self, specialty_id: int, data: ProjectSpecialtyUpdate) -> Optional[ProjectSpecialty]:
        """Обновить специальность"""
        specialty = await self.get_by_id(specialty_id)
        if not specialty:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(specialty, field, value)
        
        await self.db.commit()
        await self.db.refresh(specialty)
        return specialty
    
    async def delete(self, specialty_id: int) -> bool:
        """Удалить специальность"""
        stmt = delete(ProjectSpecialty).where(
            ProjectSpecialty.id == specialty_id
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0