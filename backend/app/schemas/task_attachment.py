from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskAttachmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    task_id: int = Field(alias="taskId")
    uploader_id: Optional[int] = Field(alias="uploaderId")
    original_name: str = Field(alias="originalName")
    file_url: str = Field(alias="fileUrl")
    content_type: str = Field(alias="contentType")
    size: int
    created_at: datetime = Field(alias="createdAt")
