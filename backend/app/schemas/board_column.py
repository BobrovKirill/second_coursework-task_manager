from pydantic import BaseModel, Field
from typing import Optional

class BoardColumnBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    position: int

class BoardColumnCreate(BoardColumnBase):
    project_id: int

class BoardColumnUpdate(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[int] = None

class BoardColumnRead(BoardColumnBase):
    id: int
    project_id: int
    
    model_config = {"from_attributes": True}