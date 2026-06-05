import uuid
from typing import Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import delete_file, upload_file
from app.models import ProjectMemberRole, Role
from app.models.project import Project
from app.models.task import Task
from app.models.task_attachment import TaskAttachment
from app.repositories.task_attachment_repository import TaskAttachmentRepository


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


class TaskAttachmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.attachment_repo = TaskAttachmentRepository(db)

    async def _get_task(self, task_id: int) -> Task:
        result = await self.db.execute(
            select(Task).where(Task.id == task_id),
        )
        task = result.scalar_one_or_none()

        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Задача не найдена",
            )

        return task

    async def _get_project(self, project_id: int) -> Project:
        result = await self.db.execute(
            select(Project).where(
                Project.id == project_id,
                Project.is_active == True,
            ),
        )
        project = result.scalar_one_or_none()

        if project is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Проект не найден",
            )

        return project

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

    async def _ensure_can_view_task(self, task: Task, user_id: int) -> None:
        project = await self._get_project(task.project_id)

        if project.owner_id == user_id:
            return

        role = await self._get_user_role(task.project_id, user_id)

        if role is not None:
            return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к задаче",
        )

    async def _ensure_can_edit_task(self, task: Task, user_id: int) -> None:
        project = await self._get_project(task.project_id)

        if project.owner_id == user_id or task.creator_id == user_id:
            return

        role = await self._get_user_role(task.project_id, user_id)

        if role in ("admin", "organizer"):
            return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав на изменение вложений задачи",
        )

    async def get_task_attachments(
        self,
        task_id: int,
        current_user_id: int,
    ) -> list[TaskAttachment]:
        task = await self._get_task(task_id)
        await self._ensure_can_view_task(task, current_user_id)

        return await self.attachment_repo.get_by_task_id(task_id)

    async def upload_task_attachment(
        self,
        task_id: int,
        file: UploadFile,
        current_user_id: int,
    ) -> TaskAttachment:
        task = await self._get_task(task_id)
        await self._ensure_can_edit_task(task, current_user_id)

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
        file_key = f"task_attachments/{task_id}/{uuid.uuid4()}.{ext}"

        file_url = upload_file(file_bytes, file_key, content_type)

        attachment = TaskAttachment(
            task_id=task_id,
            uploader_id=current_user_id,
            original_name=original_name,
            file_url=file_url,
            file_key=file_key,
            content_type=content_type,
            size=len(file_bytes),
        )

        return await self.attachment_repo.create(attachment)

    async def delete_task_attachment(
        self,
        task_id: int,
        attachment_id: int,
        current_user_id: int,
    ) -> None:
        task = await self._get_task(task_id)
        await self._ensure_can_edit_task(task, current_user_id)

        attachment = await self.attachment_repo.get_by_id(attachment_id)

        if attachment is None or attachment.task_id != task_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Вложение не найдено",
            )

        delete_file(attachment.file_key)
        await self.attachment_repo.delete(attachment)
