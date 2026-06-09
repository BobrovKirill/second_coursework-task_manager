from datetime import datetime
from typing import Optional

from humps import camelize
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.comment_attachment import CommentAttachmentRead


class CommentBase(BaseModel):
    text: str = Field(default='', max_length=5000)
    parent_id: Optional[int] = Field(default=None)
    
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=camelize,
        populate_by_name=True,
    )


class CommentCreate(BaseModel):
    text: str = Field(default='', max_length=5000)
    parent_id: Optional[int] = Field(default=None)
    
    @model_validator(mode='after')
    def validate_text_or_attachments(self):
        """Разрешаем создание комментария без текста, но с вложениями"""
        return self
    
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=camelize,
        populate_by_name=True,
    )


class CommentUpdate(BaseModel):
    text: str = Field(default='', max_length=5000)
    
    model_config = ConfigDict(
        extra="forbid",
        alias_generator=camelize,
        populate_by_name=True,
    )


class CommentAuthor(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=camelize,
        populate_by_name=True,
    )


class CommentRead(BaseModel):
    id: int
    author_id: int
    task_id: int
    parent_id: Optional[int] = None
    text: str
    created_at: datetime
    updated_at: datetime
    author: Optional[CommentAuthor] = None
    reply_count: int = 0
    attachments: list[CommentAttachmentRead] = []
    
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=camelize,
        populate_by_name=True,
    )