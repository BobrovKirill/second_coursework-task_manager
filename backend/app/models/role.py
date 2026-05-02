from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text
from app.core.database import Base

# Класс Role соответсвует одной таблице в БД и содержит в себе:
# id — первичный ключ
# name — название роли
# description — описание роли
# permissions — разрешения которые доступны роли
# member_role — участники с данной ролью
class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    permissions: Mapped[list["RolePermission"]] = relationship(back_populates="role")
    member_roles: Mapped[list["ProjectMemberRole"]] = relationship(back_populates="role")

# Класс RolePermission соответсвует одной таблице в БД и содержит в себе:
# role_id — первичные ключ ролей
# permission_id — первичные ключ разрешений
# role — роли
# permission — разрешения
class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    permission_id: Mapped[int] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)

    role: Mapped["Role"] = relationship(back_populates="permissions")
    permission: Mapped["Permission"] = relationship(back_populates="roles")