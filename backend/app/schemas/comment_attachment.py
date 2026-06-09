from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CommentAttachmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    comment_id: int = Field(alias="commentId")
    uploader_id: Optional[int] = Field(alias="uploaderId")
    original_name: str = Field(alias="originalName")
    file_url: str = Field(alias="fileUrl")
    content_type: str = Field(alias="contentType")
    size: int
    created_at: datetime = Field(alias="createdAt")