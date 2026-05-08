# app/models/project.py
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Text, Boolean, func, Integer
from typing import Optional
from datetime import datetime
import enum
from app.core.database import Base

class BackgroundType(str, enum.Enum):
    DEFAULT = "default"
    COLOR = "color"
    GRADIENT = "gradient"
    IMAGE = "image"

class Project(Base):
    __tablename__ = "projects"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.timezone('UTC', func.now())
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Настройки кастомизации
    icon_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    font_color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True, default="#000000")
    background_type: Mapped[str] = mapped_column(String(20), nullable=False, default="default")
    background_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    owner: Mapped["User"] = relationship(back_populates="owned_projects")
    members: Mapped[list["ProjectMember"]] = relationship(
        back_populates="project", 
        cascade="all, delete-orphan"
    )
    
    board_columns: Mapped[list["BoardColumn"]] = relationship(
        back_populates="project", 
        cascade="all, delete-orphan"
    )