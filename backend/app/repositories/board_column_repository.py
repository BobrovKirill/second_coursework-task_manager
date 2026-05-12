from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update as sql_update, delete as sql_delete
from app.models.board_column import BoardColumn
from app.schemas.board_column import BoardColumnCreate, BoardColumnUpdate

class BoardColumnRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_project(self, project_id: int) -> list[BoardColumn]:
        """Получить все колонки проекта, отсортированные по position"""
        result = await self.db.execute(
            select(BoardColumn)
            .where(BoardColumn.project_id == project_id)
            .order_by(BoardColumn.position)
        )
        return list(result.scalars().all())
    
    async def create(self, data: BoardColumnCreate) -> BoardColumn:
        """Создать колонку"""
        column = BoardColumn(
            project_id=data.project_id,
            title=data.title,
            position=data.position
        )
        self.db.add(column)
        await self.db.commit()
        await self.db.refresh(column)
        return column
    
    async def update(self, column_id: int, data: BoardColumnUpdate) -> BoardColumn | None:
        """Обновить колонку"""
        stmt = (
            sql_update(BoardColumn)
            .where(BoardColumn.id == column_id)
            .values(**data.model_dump(exclude_unset=True))
            .returning(BoardColumn)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        column = result.scalar_one_or_none()
        if column:
            await self.db.refresh(column)
        return column
    
    async def delete(self, column_id: int) -> bool:
        """Удалить колонку"""
        result = await self.db.execute(
            sql_delete(BoardColumn).where(BoardColumn.id == column_id)
        )
        await self.db.commit()
        return result.rowcount > 0
    
    async def create_default_columns(self, project_id: int) -> list[BoardColumn]:
        """Создать 3 базовые колонки для проекта"""
        default_columns = [
            BoardColumnCreate(project_id=project_id, title="Сделать", position=0),
            BoardColumnCreate(project_id=project_id, title="Делается", position=1),
            BoardColumnCreate(project_id=project_id, title="Сделано", position=2)
        ]
        
        columns = []
        for column_data in default_columns:
            column = await self.create(column_data)
            columns.append(column)
        
        return columns