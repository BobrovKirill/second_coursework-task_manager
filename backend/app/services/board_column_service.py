from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.board_column_repository import BoardColumnRepository
from app.schemas.board_column import BoardColumnCreate, BoardColumnUpdate

class BoardColumnService:
    def __init__(self, db: AsyncSession):
        self.column_repo = BoardColumnRepository(db)
    
    async def get_project_columns(self, project_id: int) -> list:
        """Получить колонки проекта"""
        return await self.column_repo.get_by_project(project_id)
    
    async def create_column(self, data: BoardColumnCreate):
        """Создать колонку"""
        return await self.column_repo.create(data)
    
    async def update_column(self, column_id: int, data: BoardColumnUpdate):
        """Обновить колонку"""
        return await self.column_repo.update(column_id, data)
    
    async def delete_column(self, column_id: int) -> bool:
        """Удалить колонку"""
        return await self.column_repo.delete(column_id)