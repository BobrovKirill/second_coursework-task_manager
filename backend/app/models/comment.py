from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    
    text: Mapped[str] = mapped_column(Text, nullable=False, default='')
    
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.timezone("UTC", func.now())
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.timezone("UTC", func.now()),
        onupdate=func.timezone("UTC", func.now()),
    )
    
    author: Mapped["User"] = relationship(
        "User",
        back_populates="comments",
        lazy="selectin"
    )
    task: Mapped["Task"] = relationship(
        "Task",
        back_populates="comments",
    )
    parent: Mapped[Optional["Comment"]] = relationship(
        "Comment",
        remote_side=[id],
        back_populates="replies",
    )
    replies: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan",
    )
    attachments: Mapped[list["CommentAttachment"]] = relationship(
        "CommentAttachment",
        back_populates="comment",
        cascade="all, delete-orphan",
        lazy="selectin",
    )