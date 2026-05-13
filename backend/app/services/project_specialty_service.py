from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.project_specialty_repository import ProjectSpecialtyRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_member_repository import ProjectMemberRepository
from app.schemas.project_specialty import ProjectSpecialtyCreate, ProjectSpecialtyUpdate
from app.models.project_member import ProjectMember
from sqlalchemy import select, and_, update

class ProjectSpecialtyService:
    def __init__(self, db: AsyncSession):
        self.specialty_repo = ProjectSpecialtyRepository(db)
        self.project_repo = ProjectRepository(db)
        self.member_repo = ProjectMemberRepository(db)
        self.db = db
    
    async def create_specialty(
        self, project_id: int, data: ProjectSpecialtyCreate, current_user_id: int
    ):
        """Создать специальность в проекте"""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Проект не найден"
            )
        
        if project.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только владелец проекта может создавать специальности"
            )
        
        return await self.specialty_repo.create(project_id, data)
    
    async def get_project_specialties(self, project_id: int, current_user_id: int):
        """Получить специальности проекта"""
        if not await self.member_repo.is_member(project_id, current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="У вас нет доступа к этому проекту"
            )
        
        return await self.specialty_repo.get_project_specialties(project_id)
    
    async def update_specialty(
        self, specialty_id: int, project_id: int, 
        data: ProjectSpecialtyUpdate, current_user_id: int
    ):
        """Обновить специальность"""
        project = await self.project_repo.get_by_id(project_id)
        if not project or project.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только владелец проекта может изменять специальности"
            )
        
        specialty = await self.specialty_repo.get_by_id(specialty_id)
        if not specialty or specialty.project_id != project_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Специальность не найдена"
            )
        
        return await self.specialty_repo.update(specialty_id, data)
    
    async def delete_specialty(
        self, specialty_id: int, project_id: int, current_user_id: int
    ):
        """Удалить специальность"""
        project = await self.project_repo.get_by_id(project_id)
        if not project or project.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Только владелец проекта может удалять специальности"
            )
        
        specialty = await self.specialty_repo.get_by_id(specialty_id)
        if not specialty or specialty.project_id != project_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Специальность не найдена"
            )
        
        return await self.specialty_repo.delete(specialty_id)
    
    async def assign_specialty(
        self, project_id: int, user_id: int, 
        specialty_id: int | None, current_user_id: int
    ):
        """Назначить специальность участнику"""
        if not await self.member_repo.is_member(project_id, current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="У вас нет доступа к этому проекту"
            )
        
        if not await self.member_repo.is_member(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Участник не найден в проекте"
            )
        
        if specialty_id is not None:
            specialty = await self.specialty_repo.get_by_id(specialty_id)
            if not specialty or specialty.project_id != project_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Специальность не найдена в этом проекте"
                )
        
        stmt = (
            update(ProjectMember)
            .where(
                and_(
                    ProjectMember.project_id == project_id,
                    ProjectMember.user_id == user_id
                )
            )
            .values(specialty_id=specialty_id)
        )
        await self.db.execute(stmt)
        await self.db.commit()
        
        return {"message": "Специальность назначена"}