from fastapi import HTTPException, status
from typing import Optional
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserRead


class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def create_user(self, user_data: UserCreate) -> UserRead:
        """Создание пользователя с проверкой уникальности"""
        # Проверяем email
        if await self.repository.get_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email уже зарегистрирован"
            )

        # Проверяем username
        if await self.repository.get_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username уже занят"
            )

        user = await self.repository.create(user_data)
        return UserRead.model_validate(user)

    async def get_user(self, user_id: int) -> UserRead:
        """Получение пользователя по ID"""
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден"
            )
        return UserRead.model_validate(user)

    async def get_users(self, skip: int = 0, limit: int = 100) -> list[UserRead]:
        """Получение списка пользователей"""
        users = await self.repository.get_all(skip=skip, limit=limit)
        return [UserRead.model_validate(user) for user in users]

    async def update_user(self, user_id: int, user_data: UserUpdate) -> UserRead:
        """Обновление пользователя"""
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден"
            )

        # Проверка уникальности при обновлении email
        if user_data.email and user_data.email != user.email:
            if await self.repository.get_by_email(user_data.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email уже занят"
                )

        # Проверка уникальности при обновлении username
        if user_data.username and user_data.username != user.username:
            if await self.repository.get_by_username(user_data.username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username уже занят"
                )

        if user_data.email and user_data.email != user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Изменение email недоступно"
            )

        updated_user = await self.repository.update(user, user_data)
        return UserRead.model_validate(updated_user)

    async def delete_user(self, user_id: int) -> None:
        """Удаление пользователя"""
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Пользователь не найден"
            )
        await self.repository.delete(user)

    async def search_users(self, email: Optional[str], full_name: Optional[str], project_id: Optional[int] = None) -> \
    list[UserRead]:
        if not email and not full_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Укажите хотя бы один параметр поиска"
            )
        users = await self.repository.search(email=email, full_name=full_name)

        if project_id:
            from app.repositories.project_member_repository import ProjectMemberRepository
            member_repo = ProjectMemberRepository(self.repository.db)
            result = []
            for user in users:
                if not await member_repo.is_member(project_id, user.id):
                    result.append(user)
            users = result

        return [UserRead.model_validate(u) for u in users]