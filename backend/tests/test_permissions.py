from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, Mock, patch

from fastapi import HTTPException

from app.core.permissions import require_permission


class PermissionTests(IsolatedAsyncioTestCase):
    async def test_permission_allows_request(self):
        current_user = SimpleNamespace(id=5)
        check_permission = require_permission("manage_members")

        with patch(
            "app.core.permissions.get_user_permissions",
            new=AsyncMock(return_value=["manage_members", "view_tasks"]),
        ):
            result = await check_permission(
                project_id=10,
                current_user=current_user,
                db=Mock(),
            )

        self.assertIs(result, current_user)

    async def test_missing_permission_returns_forbidden(self):
        check_permission = require_permission("manage_members")

        with (
            patch(
                "app.core.permissions.get_user_permissions",
                new=AsyncMock(return_value=["view_tasks"]),
            ),
            self.assertRaises(HTTPException) as context,
        ):
            await check_permission(
                project_id=10,
                current_user=SimpleNamespace(id=5),
                db=Mock(),
            )

        self.assertEqual(context.exception.status_code, 403)
