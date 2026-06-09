from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.comment_repository import CommentRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.project_member_repository import ProjectMemberRepository
from app.schemas.comment import CommentCreate, CommentUpdate, CommentRead


class CommentService:
    def __init__(self, db: AsyncSession):
        self.comment_repo = CommentRepository(db)
        self.task_repo = TaskRepository(db)
        self.member_repo = ProjectMemberRepository(db)
        self.db = db
    
    async def get_task_comments(self, task_id: int, current_user_id: int) -> List[CommentRead]:
        """Получить все комментарии задачи"""
        task = await self.task_repo.get_by_id(task_id)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        can_view = await self._can_access_task(task.project_id, current_user_id)
        
        if not can_view:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this task"
            )
        
        comments = await self.comment_repo.get_task_comments(task_id)
        
        result = []
        for comment in comments:
            comment_dict = {
                "id": comment.id,
                "author_id": comment.author_id,
                "task_id": comment.task_id,
                "parent_id": comment.parent_id,
                "text": comment.text,
                "created_at": comment.created_at,
                "updated_at": comment.updated_at,
                "author": {
                    "id": comment.author.id,
                    "username": comment.author.username,
                    "email": comment.author.email,
                    "avatar_url": getattr(comment.author, "avatar_url", None),
                } if comment.author else None,
                "reply_count": getattr(comment, "reply_count", 0),
            }
            result.append(CommentRead(**comment_dict))
        
        return result
    
    async def create_comment(
        self,
        task_id: int,
        data: CommentCreate,
        current_user_id: int
    ) -> CommentRead:
        """Создать комментарий к задаче"""
        task = await self.task_repo.get_by_id(task_id)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        can_access = await self._can_access_task(task.project_id, current_user_id)
        
        if not can_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this task"
            )
        
        if data.parent_id:
            parent_comment = await self.comment_repo.get_by_id(data.parent_id)
            if not parent_comment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent comment not found"
                )
            if parent_comment.task_id != task_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent comment belongs to different task"
                )
        
        comment = await self.comment_repo.create(task_id, current_user_id, data)
        
        return CommentRead(
            id=comment.id,
            author_id=comment.author_id,
            task_id=comment.task_id,
            parent_id=comment.parent_id,
            text=comment.text or '',
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            author={
                "id": comment.author.id,
                "username": comment.author.username,
                "email": comment.author.email,
                "avatar_url": getattr(comment.author, "avatar_url", None),
            } if comment.author else None,
            reply_count=0,
            attachments=[],
        )
    
    async def update_comment(
        self,
        comment_id: int,
        data: CommentUpdate,
        current_user_id: int
    ) -> CommentRead:
        """Обновить комментарий"""
        comment = await self.comment_repo.get_by_id(comment_id)
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        if comment.author_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own comments"
            )
        
        updated_comment = await self.comment_repo.update(comment, data)
        
        reply_count = getattr(updated_comment, "reply_count", 0)
        
        return CommentRead(
            id=updated_comment.id,
            author_id=updated_comment.author_id,
            task_id=updated_comment.task_id,
            parent_id=updated_comment.parent_id,
            text=updated_comment.text,
            created_at=updated_comment.created_at,
            updated_at=updated_comment.updated_at,
            author={
                "id": updated_comment.author.id,
                "username": updated_comment.author.username,
                "email": updated_comment.author.email,
                "avatar_url": getattr(updated_comment.author, "avatar_url", None),
            } if updated_comment.author else None,
            reply_count=reply_count,
        )
    
    async def delete_comment(self, comment_id: int, current_user_id: int) -> None:
        """Удалить комментарий"""
        comment = await self.comment_repo.get_by_id(comment_id)
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        can_delete = await self._can_delete_comment(
            comment, current_user_id
        )
        
        if not can_delete:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this comment"
            )
        
        await self.comment_repo.delete(comment)
    
    async def _can_access_task(self, project_id: int, user_id: int) -> bool:
        """Проверить доступ к задаче"""
        from app.repositories.project_repository import ProjectRepository
        project_repo = ProjectRepository(self.db)
        project = await project_repo.get_by_id(project_id)
        
        if not project:
            return False
        
        is_owner = project.owner_id == user_id
        is_member = await self.member_repo.is_member(project_id, user_id)
        
        return is_owner or is_member
    
    async def _can_delete_comment(self, comment, current_user_id: int) -> bool:
        """Проверить права на удаление комментария"""
        if comment.author_id == current_user_id:
            return True
        
        from app.repositories.project_repository import ProjectRepository
        project_repo = ProjectRepository(self.db)
        task = await self.task_repo.get_by_id(comment.task_id)
        
        if task:
            project = await project_repo.get_by_id(task.project_id)
            if project and project.owner_id == current_user_id:
                return True
            
            role_name = await self.member_repo.get_member_role_name(
                task.project_id, current_user_id
            )
            if role_name in ("admin", "organizer"):
                return True
        
        return False