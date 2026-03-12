from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_member_repository import ProjectMemberRepository
from app.repositories.user_repository import UserRepository
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectService:
    def __init__(self, db: AsyncSession):
        self.project_repo = ProjectRepository(db)
        self.member_repo = ProjectMemberRepository(db)
        self.user_repo = UserRepository(db)
        self.db = db
    
    async def create_project(self, data: ProjectCreate, current_user_id: int):
        """Создать проект"""
        project = await self.project_repo.create(data, current_user_id)
        
        await self.member_repo.add_member(project.id, current_user_id)
        
        return project
    
    async def get_project(self, project_id: int, current_user_id: int):
        """Получить проект с проверкой доступа"""
        project = await self.project_repo.get_by_id(project_id)
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        if not await self._can_view_project(project, current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this project"
            )
        
        return project
    
    async def get_user_projects(self, user_id: int):
        """Получить проекты пользователя"""
        return await self.project_repo.get_user_projects(user_id)
    
    async def update_project(self, project_id: int, data: ProjectUpdate, current_user_id: int):
        """Обновить проект"""
        project = await self.project_repo.get_by_id(project_id)
        
        if not project:
            raise HTTPException(404, "Project not found")
        
        if project.owner_id != current_user_id:
            raise HTTPException(403, "Only project owner can update")
        
        return await self.project_repo.update(project_id, data)
    
    async def delete_project(self, project_id: int, current_user_id: int):
        """Удалить проект"""
        project = await self.project_repo.get_by_id(project_id)
        
        if not project:
            raise HTTPException(404, "Project not found")
        
        if project.owner_id != current_user_id:
            raise HTTPException(403, "Only project owner can delete")
        
        return await self.project_repo.delete(project_id)
    
    async def add_member(self, project_id: int, user_id: int, current_user_id: int):
        """Добавить участника"""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(404, "Project not found")
    
        if project.owner_id != current_user_id:
            raise HTTPException(403, "Only project owner can add members")
    
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(404, f"User with id {user_id} not found")
    
        await self.member_repo.add_member(project_id, user_id)
    
        return user
    
    async def remove_member(self, project_id: int, user_id: int, current_user_id: int):
        """Удалить участника"""
        project = await self.project_repo.get_by_id(project_id)
        
        if not project:
            raise HTTPException(404, "Project not found")
        
        if project.owner_id != current_user_id:
            raise HTTPException(403, "Only project owner can remove members")
        
        if user_id == project.owner_id:
            raise HTTPException(400, "Cannot remove project owner")
        
        result = await self.member_repo.remove_member(project_id, user_id)
        if not result:
            raise HTTPException(404, "Member not found")
        
        return {"message": "Member removed successfully"}
    
    async def get_project_members(self, project_id: int, current_user_id: int):
        """Получить список участников"""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(404, "Project not found")
        
        if not await self._can_view_project(project, current_user_id):
            raise HTTPException(403, "You don't have access to this project")
        
        return await self.member_repo.get_project_members(project_id)
    
    async def _can_view_project(self, project, user_id: int) -> bool:
        """Проверка доступа к проекту"""
        return project.owner_id == user_id or await self.member_repo.is_member(project.id, user_id)