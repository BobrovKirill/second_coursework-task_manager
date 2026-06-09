import uuid
from typing import Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import delete_file, upload_file
from app.models.comment import Comment
from app.models.comment_attachment import CommentAttachment
from app.models.project import Project
from app.models.project_member import ProjectMemberRole
from app.models.role import Role
from app.repositories.comment_attachment_repository import CommentAttachmentRepository
from app.repositories.comment_repository import CommentRepository


ALLOWED_ATTACHMENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024


class CommentAttachmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.attachment_repo = CommentAttachmentRepository(db)
        self.comment_repo = CommentRepository(db)

    async def _get_comment(self, comment_id: int) -> Comment:
        comment = await self.comment_repo.get_by_id(comment_id)

        if comment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Комментарий не найден",
            )

        return comment

    async def _get_user_role(self, project_id: int, user_id: int) -> Optional[str]:
        role_result = await self.db.execute(
            select(Role.name)
            .join(ProjectMemberRole, ProjectMemberRole.role_id == Role.id)
            .where(
                ProjectMemberRole.project_id == project_id,
                ProjectMemberRole.user_id == user_id,
            ),
        )
        return role_result.scalar_one_or_none()

    async def _ensure_can_edit_comment(self, comment: Comment, user_id: int) -> None:
        if comment.author_id == user_id:
            return

        task_result = await self.db.execute(
            select(Comment).where(Comment.id == comment.id)
        )
        comment_with_task = task_result.scalar_one()
        
        project_result = await self.db.execute(
            select(Project).where(
                Project.id == comment_with_task.task.project_id,
                Project.is_active == True,
            )
        )
        project = project_result.scalar_one_or_none()

        if project is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет прав на изменение вложений комментария",
            )

        if project.owner_id == user_id:
            return

        role = await self._get_user_role(project.id, user_id)
        if role in ("admin", "organizer"):
            return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав на изменение вложений комментария",
        )

    async def get_comment_attachments(
        self,
        comment_id: int,
        current_user_id: int,
    ) -> list[CommentAttachment]:
        comment = await self._get_comment(comment_id)
        return await self.attachment_repo.get_by_comment_id(comment_id)

    async def upload_comment_attachment(
        self,
        comment_id: int,
        file: UploadFile,
        current_user_id: int,
    ) -> CommentAttachment:
        comment = await self._get_comment(comment_id)
        await self._ensure_can_edit_comment(comment, current_user_id)

        content_type = file.content_type or "application/octet-stream"

        if content_type not in ALLOWED_ATTACHMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Недопустимый тип файла",
            )

        file_bytes = await file.read()

        if len(file_bytes) > MAX_ATTACHMENT_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Размер файла не должен превышать 10 МБ",
            )

        original_name = file.filename or "attachment"
        ext = original_name.split(".")[-1] if "." in original_name else "bin"
        file_key = f"comment_attachments/{comment_id}/{uuid.uuid4()}.{ext}"

        file_url = upload_file(file_bytes, file_key, content_type)

        attachment = CommentAttachment(
            comment_id=comment_id,
            uploader_id=current_user_id,
            original_name=original_name,
            file_url=file_url,
            file_key=file_key,
            content_type=content_type,
            size=len(file_bytes),
        )

        return await self.attachment_repo.create(attachment)

    async def delete_comment_attachment(
        self,
        comment_id: int,
        attachment_id: int,
        current_user_id: int,
    ) -> None:
        comment = await self._get_comment(comment_id)
        await self._ensure_can_edit_comment(comment, current_user_id)

        attachment = await self.attachment_repo.get_by_id(attachment_id)

        if attachment is None or attachment.comment_id != comment_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Вложение не найдено",
            )

        delete_file(attachment.file_key)
        await self.attachment_repo.delete(attachment)