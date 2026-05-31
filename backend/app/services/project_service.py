from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy import select, func, delete
from sqlalchemy.exc import IntegrityError

from app.models import ProjectMemberRole
from app.models.role import Role
from app.repositories.project_repository import ProjectRepository
from app.repositories.project_member_repository import ProjectMemberRepository
from app.repositories.user_repository import UserRepository
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.repositories.board_column_repository import BoardColumnRepository
from app.models.project_member import ProjectMember
from sqlalchemy.orm import joinedload

class ProjectService:
    def __init__(self, db: AsyncSession):
        self.project_repo = ProjectRepository(db)
        self.member_repo = ProjectMemberRepository(db)
        self.user_repo = UserRepository(db)
        self.column_repo = BoardColumnRepository(db)
        self.db = db

    async def create_project(self, data: ProjectCreate, current_user_id: int):
        """Создать проект"""
        project = await self.project_repo.create(data, current_user_id)

        result = await self.db.execute(
            select(Role).where(Role.name == "admin")
        )
        admin_role = result.scalar_one()

        await self.member_repo.add_member(
            project.id,
            current_user_id
        )

        self.db.add(
            ProjectMemberRole(
                project_id=project.id,
                user_id=current_user_id,
                role_id=admin_role.id
            )
        )

        await self.column_repo.create_default_columns(project.id)
        await self.db.commit()

        return project

    async def get_project(self, project_id: int, current_user_id: int):
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        if not await self.member_repo.is_member(project_id, current_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have access to this project")

        return project

    async def get_user_projects(self, user_id: int):
        """Получить проекты пользователя"""
        return await self.project_repo.get_user_projects(user_id)

    async def update_project(self, project_id: int, data: ProjectUpdate, current_user_id: int):
        """Обновить проект"""
        project = await self.project_repo.get_by_id(project_id)

        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return await self.project_repo.update(project_id, data)

    async def delete_project(self, project_id: int, current_user_id: int):
        """Удалить проект"""
        project = await self.project_repo.get_by_id(project_id)

        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return await self.project_repo.delete(project_id)

    async def add_member(
            self,
            project_id: int,
            user_id: int,
            current_user_id: int,
            role_name: str = "executor",
            specialty: str = ''
    ):
        """Добавить участника в проект"""

        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        # Надёжная проверка
        if await self.member_repo.is_member(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь уже является участником проекта"
            )

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found"
            )

        # Проверка роли
        role_result = await self.db.execute(select(Role).where(Role.name == role_name))
        role = role_result.scalar_one_or_none()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Роль '{role_name}' не существует"
            )

        try:
            member = await self.member_repo.add_member(
                project_id,
                user_id
            )

            if specialty is not None:
                member.specialty_id = specialty

            self.db.add(
                ProjectMemberRole(
                    project_id=project_id,
                    user_id=user_id,
                    role_id=role.id
                )
            )

            await self.db.commit()

            return await self._get_member_with_role(project_id, user_id)

        except IntegrityError as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Пользователь уже является участником проекта"
            )

        except Exception as e:
            await self.db.rollback()
            print(f"Error adding member: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ошибка при добавлении участника"
            )

    # async def remove_member(self, project_id: int, user_id: int, current_user_id: int):
    #
    #     project = await self.project_repo.get_by_id(project_id)
    #
    #     if not project:
    #         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    #
    #     if user_id == project.owner_id:
    #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove project owner")
    #
    #     result = await self.member_repo.remove_member(project_id, user_id)
    #     if not result:
    #         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    #
    #     return {"message": "Member removed successfully"}

    async def remove_member(self, project_id: int, user_id: int, current_user_id: int) -> bool:
        """Удалить участника"""
        await self.db.execute(
            delete(ProjectMemberRole).where(
                ProjectMemberRole.project_id == project_id,
                ProjectMemberRole.user_id == user_id
            )
        )

        result = await self.db.execute(
            delete(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id
            )
        )

        await self.db.commit()

        return result.rowcount > 0

    async def get_project_members(self, project_id: int, current_user_id: int):
        """Получить список участников"""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        if not await self.member_repo.is_member(project_id, current_user_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have access to this project")

        members = await self.member_repo.get_project_members(project_id)
        
        member_ids = [m.user_id for m in members]
        roles_query = select(ProjectMemberRole).where(
            ProjectMemberRole.project_id == project_id,
            ProjectMemberRole.user_id.in_(member_ids)
        )
        roles_result = await self.db.execute(roles_query)
        roles = {r.user_id: r for r in roles_result.scalars().all()}
        
        result = []
        for member in members:
            member_dict = {
                "project_id": member.project_id,
                "member": member.member,
                "joined_at": member.joined_at,
                "specialty": member.specialty,
                "role": None
            }
            
            if member.user_id in roles:
                role_query = select(Role).where(Role.id == roles[member.user_id].role_id)
                role_result = await self.db.execute(role_query)
                role = role_result.scalar_one_or_none()
                if role:
                    member_dict["role"] = role.name
            
            result.append(member_dict)
        
        return result

    async def get_project_member(
            self,
            project_id: int,
            user_id: int,
            current_user_id: int
    ):
        """Получить одного участника проекта"""

        # Проверяем существование проекта
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Проверяем, имеет ли текущий пользователь доступ к проекту
        if not await self.member_repo.is_member(project_id, current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this project"
            )

        # Получаем конкретного участника
        member = await self.member_repo.get_project_member(project_id, user_id)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found in this project"
            )

        # Получаем роль участника
        role_query = select(ProjectMemberRole).where(
            ProjectMemberRole.project_id == project_id,
            ProjectMemberRole.user_id == user_id
        )
        role_result = await self.db.execute(role_query)
        project_member_role = role_result.scalar_one_or_none()

        role_name = None
        if project_member_role:
            role_obj = await self.db.execute(
                select(Role).where(Role.id == project_member_role.role_id)
            )
            role = role_obj.scalar_one_or_none()
            if role:
                role_name = role.name

        # Формируем результат
        return {
            "project_id": member.project_id,
            "member": member.member,
            "joined_at": member.joined_at,
            "specialty": member.specialty,
            "role": role_name
        }

    async def _get_member_with_role(self, project_id: int, user_id: int) -> ProjectMember:
        """Получить участника с relationships и ролью"""
        result = await self.db.execute(
            select(ProjectMember)
            .options(joinedload(ProjectMember.member), joinedload(ProjectMember.specialty))
            .where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id
            )
        )
        member = result.scalar_one()

        role_result = await self.db.execute(
            select(Role.name)
            .join(ProjectMemberRole, ProjectMemberRole.role_id == Role.id)
            .where(
                ProjectMemberRole.project_id == project_id,
                ProjectMemberRole.user_id == user_id
            )
        )
        member.role = role_result.scalar_one_or_none()
        return member

    async def assign_role(self, project_id: int, user_id: int, role_name: str, current_user_id: int):
        if not await self.member_repo.is_member(project_id, user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Участник не найден в проекте")

        result = await self.db.execute(select(Role).where(Role.name == role_name))
        role = result.scalar_one_or_none()
        if not role:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Роль '{role_name}' не существует")

        current_role_result = await self.db.execute(
            select(ProjectMemberRole.role_id).where(
                ProjectMemberRole.project_id == project_id,
                ProjectMemberRole.user_id == user_id
            )
        )
        current_role_id = current_role_result.scalar_one_or_none()
        admin_role_result = await self.db.execute(select(Role.id).where(Role.name == "admin"))
        admin_role_id = admin_role_result.scalar_one()

        if current_role_id == admin_role_id and role_name != "admin":
            admins_result = await self.db.execute(
                select(func.count(ProjectMemberRole.user_id))
                .join(Role, Role.id == ProjectMemberRole.role_id)
                .where(ProjectMemberRole.project_id == project_id, Role.name == "admin")
            )
            if admins_result.scalar_one() <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Нельзя сменить роль единственного администратора проекта"
                )

        member_role_result = await self.db.execute(
            select(ProjectMemberRole).where(
                ProjectMemberRole.project_id == project_id,
                ProjectMemberRole.user_id == user_id
            )
        )
        member_role = member_role_result.scalar_one_or_none()

        if member_role:
            member_role.role_id = role.id
        else:
            member_role = ProjectMemberRole(project_id=project_id, user_id=user_id, role_id=role.id)
            self.db.add(member_role)

        await self.db.commit()
        return await self._get_member_with_role(project_id, user_id)

    async def assign_specialty(self, project_id: int, user_id: int, specialty: Optional[int], current_user_id: int):
        result = await self.db.execute(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.user_id == user_id
            )
        )
        member = result.scalar_one_or_none()
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Участник не найден в проекте")

        member.specialty_id = specialty
        await self.db.commit()
        return await self._get_member_with_role(project_id, user_id)