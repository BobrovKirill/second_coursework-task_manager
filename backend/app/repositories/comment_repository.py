from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate


class CommentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, task_id: int, author_id: int, data: CommentCreate) -> Comment:
        """Создать комментарий"""
        comment = Comment(
            task_id=task_id,
            author_id=author_id,
            parent_id=data.parent_id,
            text=data.text,
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        
        stmt = (
            select(Comment)
            .options(
                selectinload(Comment.author),
                selectinload(Comment.parent),
            )
            .where(Comment.id == comment.id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()
    
    async def get_by_id(self, comment_id: int) -> Optional[Comment]:
        """Получить комментарий по ID"""
        stmt = (
            select(Comment)
            .options(
                selectinload(Comment.author),
                selectinload(Comment.parent),
            )
            .where(Comment.id == comment_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_task_comments(self, task_id: int) -> List[Comment]:
        """Получить все комментарии задачи"""
        stmt = (
            select(Comment)
            .options(
                selectinload(Comment.author),
                selectinload(Comment.parent),
            )
            .where(Comment.task_id == task_id)
            .order_by(Comment.created_at.asc())
        )
        result = await self.db.execute(stmt)
        comments = list(result.scalars().all())
        
        comment_ids = [c.id for c in comments]
        if comment_ids:
            reply_counts_stmt = (
                select(
                    Comment.parent_id,
                    func.count(Comment.id).label("reply_count")
                )
                .where(Comment.parent_id.in_(comment_ids))
                .group_by(Comment.parent_id)
            )
            reply_result = await self.db.execute(reply_counts_stmt)
            reply_counts = {row.parent_id: row.reply_count for row in reply_result}
            
            for comment in comments:
                comment.reply_count = reply_counts.get(comment.id, 0)
        
        return comments
    
    async def update(self, comment: Comment, data: CommentUpdate) -> Comment:
        """Обновить комментарий"""
        update_data = data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(comment, field, value)
        
        await self.db.commit()
        await self.db.refresh(comment)
        
        stmt = (
            select(Comment)
            .options(
                selectinload(Comment.author),
                selectinload(Comment.parent),
            )
            .where(Comment.id == comment.id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()
    
    async def delete(self, comment: Comment) -> None:
        """Удалить комментарий"""
        await self.db.delete(comment)
        await self.db.commit()