from datetime import datetime
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

from fastapi import HTTPException

from app.api.v1.auth import (
    PASSWORD_RESET_REQUEST_MESSAGE,
    confirm_password_reset,
    login,
    request_password_reset,
    verify_email,
)
from app.schemas.token import (
    EmailVerificationRequest,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
)
from app.schemas.user import UserCreate
from app.services.user_service import UserService


def make_user(**overrides):
    values = {
        "id": 1,
        "email": "user@example.com",
        "username": "user",
        "is_active": True,
        "is_superuser": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class UserRegistrationTests(IsolatedAsyncioTestCase):
    async def test_registration_creates_inactive_user_and_sends_email(self):
        repository = Mock()
        repository.db = Mock()
        repository.get_by_email = AsyncMock(return_value=None)
        repository.get_by_username = AsyncMock(return_value=None)
        repository.create = AsyncMock(
            return_value=make_user(is_active=False),
        )

        service = UserService(repository)
        service._send_email_verification = AsyncMock()

        result = await service.create_user(
            UserCreate(
                email="user@example.com",
                username="user",
                password="password123",
                confirm="password123",
            )
        )

        created_data = repository.create.await_args.args[0]
        self.assertFalse(created_data.is_active)
        self.assertFalse(result.is_active)
        service._send_email_verification.assert_awaited_once_with(
            1,
            "user@example.com",
        )

    async def test_registration_rejects_existing_email(self):
        repository = Mock()
        repository.db = Mock()
        repository.get_by_email = AsyncMock(return_value=make_user())
        repository.get_by_username = AsyncMock()
        repository.create = AsyncMock()

        service = UserService(repository)

        with self.assertRaises(HTTPException) as context:
            await service.create_user(
                UserCreate(
                    email="user@example.com",
                    username="other_user",
                    password="password123",
                    confirm="password123",
                )
            )

        self.assertEqual(context.exception.status_code, 400)
        repository.create.assert_not_awaited()


class AuthenticationTests(IsolatedAsyncioTestCase):
    async def test_login_returns_bearer_token_for_active_user(self):
        repository = Mock()
        repository.authenticate = AsyncMock(return_value=make_user())

        with (
            patch(
                "app.api.v1.auth.UserRepository",
                return_value=repository,
            ),
            patch(
                "app.api.v1.auth.create_access_token",
                return_value="jwt-token",
            ),
        ):
            result = await login(
                LoginRequest(
                    email="user@example.com",
                    password="password123",
                ),
                db=Mock(),
            )

        self.assertEqual(result.access_token, "jwt-token")
        self.assertEqual(result.token_type, "bearer")

    async def test_email_verification_activates_user_and_uses_token(self):
        email_token = SimpleNamespace(user_id=1)
        user = make_user(is_active=False)

        token_repository = Mock()
        token_repository.get_active_token = AsyncMock(return_value=email_token)
        token_repository.mark_used = AsyncMock()

        user_repository = Mock()
        user_repository.get_by_id = AsyncMock(return_value=user)
        user_repository.set_active = AsyncMock()

        with (
            patch(
                "app.api.v1.auth.EmailActionTokenRepository",
                return_value=token_repository,
            ),
            patch(
                "app.api.v1.auth.UserRepository",
                return_value=user_repository,
            ),
        ):
            result = await verify_email(
                EmailVerificationRequest(token="verification-token"),
                db=Mock(),
            )

        self.assertEqual(result.message, "Email подтвержден")
        user_repository.set_active.assert_awaited_once_with(user, True)
        token_repository.mark_used.assert_awaited_once_with(email_token)


class PasswordResetTests(IsolatedAsyncioTestCase):
    async def test_unknown_email_returns_generic_reset_message(self):
        user_repository = Mock()
        user_repository.get_by_email = AsyncMock(return_value=None)

        token_repository = Mock()
        token_repository.create = AsyncMock()

        email_service = Mock()

        with (
            patch(
                "app.api.v1.auth.UserRepository",
                return_value=user_repository,
            ),
            patch(
                "app.api.v1.auth.EmailActionTokenRepository",
                return_value=token_repository,
            ),
            patch(
                "app.api.v1.auth.EmailService",
                return_value=email_service,
            ),
        ):
            result = await request_password_reset(
                PasswordResetRequest(email="unknown@example.com"),
                db=Mock(),
            )

        self.assertEqual(result.message, PASSWORD_RESET_REQUEST_MESSAGE)
        token_repository.create.assert_not_awaited()
        email_service.send_password_reset.assert_not_called()

    async def test_valid_reset_token_updates_password_and_becomes_used(self):
        reset_token = SimpleNamespace(user_id=1)
        user = make_user()

        token_repository = Mock()
        token_repository.get_active_token = AsyncMock(return_value=reset_token)
        token_repository.mark_used = AsyncMock()

        user_repository = Mock()
        user_repository.get_by_id = AsyncMock(return_value=user)
        user_repository.set_password = AsyncMock()

        with (
            patch(
                "app.api.v1.auth.EmailActionTokenRepository",
                return_value=token_repository,
            ),
            patch(
                "app.api.v1.auth.UserRepository",
                return_value=user_repository,
            ),
        ):
            result = await confirm_password_reset(
                PasswordResetConfirm(
                    token="reset-token",
                    password="new_password",
                    confirm="new_password",
                ),
                db=Mock(),
            )

        self.assertEqual(result.message, "Пароль обновлен")
        user_repository.set_password.assert_awaited_once_with(
            user,
            "new_password",
        )
        token_repository.mark_used.assert_awaited_once_with(reset_token)
