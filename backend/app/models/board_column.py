from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class BoardColumn(Base):
    __tablename__ = "board_columns"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    
    project: Mapped["Project"] = relationship(back_populates="board_columns")
    
    __table_args__ = (
        UniqueConstraint('project_id', 'position', name='uq_project_column_position'),
    )