from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.role import Role

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("/", response_model=list[dict])
async def get_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Role))
    roles = result.scalars().all()
    return [{"id": r.id, "name": r.name, "description": r.description} for r in roles]