from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlencode

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import generate_action_token, hash_action_token
from app.models import ProjectMemberRole
from app.models.project_specialty import ProjectSpecialty
from app.models.role import Role
from app.repositories.project_invitation_repository import ProjectInvitationRepository
from app.repositories.project_member_repository import ProjectMemberRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository
from app.schemas.project_invitation import ProjectInvitationAccept, ProjectInvitationCreate
from app.schemas.token import MessageResponse
from app.services.email_service import EmailDeliveryError, EmailService


class ProjectInvitationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.project_repo = ProjectRepository(db)
        self.member_repo = ProjectMemberRepository(db)
        self.user_repo = UserRepository(db)
        self.invitation_repo = ProjectInvitationRepository(db)
        self.email_service = EmailService()

    async def create_invitation(
        self,
        project_id: int,
        data: ProjectInvitationCreate,
        invited_by_id: int,
    ) -> MessageResponse:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Проект не найден",
            )

        role = await self._get_role(data.role)
        await self._validate_specialty(project_id, data.specialty)

        email = data.email.lower()
        existing_user = await self.user_repo.get_by_email(email)
        if existing_user:
            await self._add_existing_user(
                project_id=project_id,
                user_id=existing_user.id,
                role_id=role.id,
                specialty_id=data.specialty,
            )
            return MessageResponse(message="Пользователь добавлен в проект")

        await self.invitation_repo.expire_pending_for_email(project_id, email)

        token = generate_action_token()
        await self.invitation_repo.create(
            project_id=project_id,
            invited_by_id=invited_by_id,
            email=email,
            role=role.name,
            specialty_id=data.specialty,
            token_hash=hash_action_token(token),
            expires_at=datetime.utcnow() + timedelta(
                days=settings.PROJECT_INVITATION_TOKEN_EXPIRE_DAYS,
            ),
        )

        try:
            self.email_service.send_project_invitation(
                to_email=email,
                invitation_url=self._build_invitation_url(token),
                project_name=project.name,
            )
        except EmailDeliveryError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Не удалось отправить приглашение. Проверьте, что Mailpit запущен",
            )

        return MessageResponse(message="Приглашение отправлено")

    async def accept_invitation(self, data: ProjectInvitationAccept) -> MessageResponse:
        invitation = await self.invitation_repo.get_active_by_token_hash(
            hash_action_token(data.token),
        )

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ссылка приглашения недействительна или устарела",
            )

        existing_user = await self.user_repo.get_by_email(invitation.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже зарегистрирован",
            )

        role = await self._get_role(invitation.role)
        await self._validate_specialty(invitation.project_id, invitation.specialty_id)

        user = await self.user_repo.create_invited_user(
            email=invitation.email,
            password=data.password,
        )

        await self._add_existing_user(
            project_id=invitation.project_id,
            user_id=user.id,
            role_id=role.id,
            specialty_id=invitation.specialty_id,
        )
        await self.invitation_repo.mark_used(invitation)

        return MessageResponse(message="Приглашение принято")

    async def _add_existing_user(
        self,
        project_id: int,
        user_id: int,
        role_id: int,
        specialty_id: Optional[int],
    ) -> None:
        if await self.member_repo.is_member(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь уже является участником проекта",
            )

        member = await self.member_repo.add_member(project_id, user_id)
        if member:
            member.specialty_id = specialty_id

        self.db.add(
            ProjectMemberRole(
                project_id=project_id,
                user_id=user_id,
                role_id=role_id,
            )
        )
        await self.db.commit()

    async def _get_role(self, role_name: str) -> Role:
        result = await self.db.execute(select(Role).where(Role.name == role_name))
        role = result.scalar_one_or_none()

        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Роль '{role_name}' не существует",
            )

        return role

    async def _validate_specialty(
        self,
        project_id: int,
        specialty_id: Optional[int],
    ) -> None:
        if specialty_id is None:
            return

        result = await self.db.execute(
            select(ProjectSpecialty).where(
                ProjectSpecialty.id == specialty_id,
                ProjectSpecialty.project_id == project_id,
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Специальность не найдена в этом проекте",
            )

    def _build_invitation_url(self, token: str) -> str:
        query = urlencode({"token": token})
        return f"{settings.FRONTEND_URL.rstrip('/')}/auth/accept-invitation?{query}"
