from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task_attachment import TaskAttachment


class TaskAttachmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_task_id(self, task_id: int) -> list[TaskAttachment]:
        result = await self.db.execute(
            select(TaskAttachment)
            .where(TaskAttachment.task_id == task_id)
            .order_by(TaskAttachment.created_at.desc()),
        )
        return list(result.scalars().all())

    async def get_by_id(self, attachment_id: int) -> TaskAttachment | None:
        result = await self.db.execute(
            select(TaskAttachment).where(TaskAttachment.id == attachment_id),
        )
        return result.scalar_one_or_none()

    async def create(self, attachment: TaskAttachment) -> TaskAttachment:
        self.db.add(attachment)
        await self.db.commit()
        await self.db.refresh(attachment)
        return attachment

    async def delete(self, attachment: TaskAttachment) -> None:
        await self.db.delete(attachment)
        await self.db.commit()