from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

from app.core.security import hash_action_token
from app.schemas.project_invitation import (
    ProjectInvitationAccept,
    ProjectInvitationCreate,
)
from app.services.project_invitation_service import ProjectInvitationService


class ProjectInvitationTests(IsolatedAsyncioTestCase):
    def setUp(self):
        self.db = Mock()
        self.db.add = Mock()
        self.db.commit = AsyncMock()

        self.service = ProjectInvitationService(self.db)
        self.service.project_repo = Mock()
        self.service.member_repo = Mock()
        self.service.user_repo = Mock()
        self.service.invitation_repo = Mock()
        self.service.email_service = Mock()

    async def test_existing_user_is_added_without_email(self):
        project = SimpleNamespace(id=10, name="Project")
        role = SimpleNamespace(id=2, name="executor")
        user = SimpleNamespace(id=7, email="member@example.com")

        self.service.project_repo.get_by_id = AsyncMock(return_value=project)
        self.service.user_repo.get_by_email = AsyncMock(return_value=user)
        self.service._get_role = AsyncMock(return_value=role)
        self.service._validate_specialty = AsyncMock()
        self.service._add_existing_user = AsyncMock()

        result = await self.service.create_invitation(
            project_id=10,
            data=ProjectInvitationCreate(
                email="MEMBER@example.com",
                role="executor",
                specialty=3,
            ),
            invited_by_id=1,
        )

        self.assertEqual(result.message, "Пользователь добавлен в проект")
        self.service._add_existing_user.assert_awaited_once_with(
            project_id=10,
            user_id=7,
            role_id=2,
            specialty_id=3,
        )
        self.service.email_service.send_project_invitation.assert_not_called()

    async def test_new_user_gets_hashed_invitation_and_email(self):
        project = SimpleNamespace(id=10, name="Project")
        role = SimpleNamespace(id=2, name="executor")

        self.service.project_repo.get_by_id = AsyncMock(return_value=project)
        self.service.user_repo.get_by_email = AsyncMock(return_value=None)
        self.service.invitation_repo.expire_pending_for_email = AsyncMock()
        self.service.invitation_repo.create = AsyncMock()
        self.service._get_role = AsyncMock(return_value=role)
        self.service._validate_specialty = AsyncMock()

        with patch(
            "app.services.project_invitation_service.generate_action_token",
            return_value="raw-invitation-token",
        ):
            result = await self.service.create_invitation(
                project_id=10,
                data=ProjectInvitationCreate(
                    email="NEW@example.com",
                    role="executor",
                ),
                invited_by_id=1,
            )

        self.assertEqual(result.message, "Приглашение отправлено")
        create_kwargs = self.service.invitation_repo.create.await_args.kwargs
        self.assertEqual(create_kwargs["email"], "new@example.com")
        self.assertEqual(
            create_kwargs["token_hash"],
            hash_action_token("raw-invitation-token"),
        )
        self.service.email_service.send_project_invitation.assert_called_once()
        invitation_url = (
            self.service.email_service.send_project_invitation
            .call_args.kwargs["invitation_url"]
        )
        self.assertIn("raw-invitation-token", invitation_url)

    async def test_accept_invitation_creates_user_and_adds_to_project(self):
        invitation = SimpleNamespace(
            email="new@example.com",
            role="executor",
            project_id=10,
            specialty_id=3,
        )
        role = SimpleNamespace(id=2, name="executor")
        user = SimpleNamespace(id=7, email="new@example.com")

        self.service.invitation_repo.get_active_by_token_hash = AsyncMock(
            return_value=invitation,
        )
        self.service.invitation_repo.mark_used = AsyncMock()
        self.service.user_repo.get_by_email = AsyncMock(return_value=None)
        self.service.user_repo.create_invited_user = AsyncMock(
            return_value=user,
        )
        self.service._get_role = AsyncMock(return_value=role)
        self.service._validate_specialty = AsyncMock()
        self.service._add_existing_user = AsyncMock()

        result = await self.service.accept_invitation(
            ProjectInvitationAccept(
                token="invitation-token",
                password="password123",
                confirm="password123",
            )
        )

        self.assertEqual(result.message, "Приглашение принято")
        self.service.user_repo.create_invited_user.assert_awaited_once_with(
            email="new@example.com",
            password="password123",
        )
        self.service._add_existing_user.assert_awaited_once_with(
            project_id=10,
            user_id=7,
            role_id=2,
            specialty_id=3,
        )
        self.service.invitation_repo.mark_used.assert_awaited_once_with(
            invitation,
        )
