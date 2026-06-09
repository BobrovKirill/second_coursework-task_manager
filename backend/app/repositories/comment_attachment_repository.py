from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment_attachment import CommentAttachment


class CommentAttachmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_comment_id(self, comment_id: int) -> list[CommentAttachment]:
        result = await self.db.execute(
            select(CommentAttachment)
            .where(CommentAttachment.comment_id == comment_id)
            .order_by(CommentAttachment.created_at.desc()),
        )
        return list(result.scalars().all())

    async def get_by_id(self, attachment_id: int) -> Optional[CommentAttachment]:
        result = await self.db.execute(
            select(CommentAttachment).where(CommentAttachment.id == attachment_id),
        )
        return result.scalar_one_or_none()

    async def create(self, attachment: CommentAttachment) -> CommentAttachment:
        self.db.add(attachment)
        await self.db.commit()
        await self.db.refresh(attachment)
        return attachment

    async def delete(self, attachment: CommentAttachment) -> None:
        await self.db.delete(attachment)
        await self.db.commit()