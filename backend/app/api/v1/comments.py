from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession


from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.comment import CommentRead, CommentUpdate
from app.schemas.comment_attachment import CommentAttachmentRead
from app.services.comment_service import CommentService
from app.services.comment_attachment_service import CommentAttachmentService

router = APIRouter(prefix="/comments", tags=["Comments"])


async def get_comment_service(db: AsyncSession = Depends(get_db)):
    return CommentService(db)

async def get_comment_attachment_service(db: AsyncSession = Depends(get_db)):
    return CommentAttachmentService(db)

@router.put("/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: int,
    data: CommentUpdate,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user),
):
    """Обновить комментарий"""
    return await service.update_comment(comment_id, data, current_user.id)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user),
):
    """Удалить комментарий"""
    await service.delete_comment(comment_id, current_user.id)

@router.get("/{comment_id}/attachments", response_model=list[CommentAttachmentRead])
async def get_comment_attachments(
    comment_id: int,
    service: CommentAttachmentService = Depends(get_comment_attachment_service),
    current_user: User = Depends(get_current_user),
):
    """Получить вложения комментария"""
    return await service.get_comment_attachments(comment_id, current_user.id)


@router.post(
    "/{comment_id}/attachments",
    response_model=CommentAttachmentRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_comment_attachment(
    comment_id: int,
    file: UploadFile = File(...),
    service: CommentAttachmentService = Depends(get_comment_attachment_service),
    current_user: User = Depends(get_current_user),
):
    """Загрузить вложение к комментарию"""
    return await service.upload_comment_attachment(comment_id, file, current_user.id)


@router.delete(
    "/{comment_id}/attachments/{attachment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_comment_attachment(
    comment_id: int,
    attachment_id: int,
    service: CommentAttachmentService = Depends(get_comment_attachment_service),
    current_user: User = Depends(get_current_user),
):
    """Удалить вложение комментария"""
    await service.delete_comment_attachment(comment_id, attachment_id, current_user.id)