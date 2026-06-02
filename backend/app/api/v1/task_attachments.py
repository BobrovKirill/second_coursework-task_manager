from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.task_attachment import TaskAttachmentRead
from app.services.task_attachment_service import TaskAttachmentService

router = APIRouter(prefix="/tasks/{task_id}/attachments", tags=["Task Attachments"])


async def get_task_attachment_service(db: AsyncSession = Depends(get_db)):
    return TaskAttachmentService(db)


@router.get("/", response_model=list[TaskAttachmentRead])
async def get_task_attachments(
    task_id: int,
    service: TaskAttachmentService = Depends(get_task_attachment_service),
    current_user: User = Depends(get_current_user),
):
    return await service.get_task_attachments(task_id, current_user.id)


@router.post(
    "/",
    response_model=TaskAttachmentRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_task_attachment(
    task_id: int,
    file: UploadFile = File(...),
    service: TaskAttachmentService = Depends(get_task_attachment_service),
    current_user: User = Depends(get_current_user),
):
    return await service.upload_task_attachment(task_id, file, current_user.id)


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_attachment(
    task_id: int,
    attachment_id: int,
    service: TaskAttachmentService = Depends(get_task_attachment_service),
    current_user: User = Depends(get_current_user),
):
    await service.delete_task_attachment(task_id, attachment_id, current_user.id)