from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.board_column_service import BoardColumnService
from app.schemas.board_column import (
    BoardColumnCreate, 
    BoardColumnUpdate, 
    BoardColumnRead
)
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/columns", tags=["Board Columns"])

async def get_column_service(db: AsyncSession = Depends(get_db)):
    return BoardColumnService(db)

@router.post("/", response_model=BoardColumnRead, status_code=status.HTTP_201_CREATED)
async def create_column(
    data: BoardColumnCreate,
    service: BoardColumnService = Depends(get_column_service),
    current_user: User = Depends(get_current_user)
):
    """Создать новую колонку"""
    return await service.create_column(data)

@router.put("/{column_id}", response_model=BoardColumnRead)
async def update_column(
    column_id: int,
    data: BoardColumnUpdate,
    service: BoardColumnService = Depends(get_column_service),
    current_user: User = Depends(get_current_user)
):
    """Обновить колонку"""
    column = await service.update_column(column_id, data)
    if not column:
        raise HTTPException(status_code=404, detail="Колонка не найдена")
    return column

@router.delete("/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    column_id: int,
    service: BoardColumnService = Depends(get_column_service),
    current_user: User = Depends(get_current_user)
):
    """Удалить колонку"""
    deleted = await service.delete_column(column_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Колонка не найдена")