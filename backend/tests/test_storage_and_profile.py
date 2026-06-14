from datetime import date
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase, TestCase
from unittest.mock import AsyncMock, patch

from app.core.config import settings
from app.core.storage import upload_file
from app.services.task_service import TaskService


class StorageTests(TestCase):
    @patch("app.core.storage.s3.put_object")
    def test_upload_file_sends_object_to_s3_and_returns_url(self, put_object):
        result = upload_file(
            b"file-content",
            "avatars/avatar.png",
            "image/png",
        )

        put_object.assert_called_once_with(
            Bucket=settings.MINIO_BUCKET,
            Key="avatars/avatar.png",
            Body=b"file-content",
            ContentType="image/png",
        )
        self.assertEqual(
            result,
            (
                f"{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/"
                "avatars/avatar.png"
            ),
        )


class ProfileTaskTests(IsolatedAsyncioTestCase):
    async def test_profile_tasks_include_project_name(self):
        task = SimpleNamespace(
            id=4,
            title="Подготовить отчет",
            project_id=10,
            status="in_progress",
            priority=2,
            deadline=date(2026, 6, 30),
        )

        service = TaskService(AsyncMock())
        service.task_repo.get_user_tasks = AsyncMock(
            return_value=[(task, "Coursework")],
        )

        result = await service.get_user_tasks(current_user_id=7)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].title, "Подготовить отчет")
        self.assertEqual(result[0].project_name, "Coursework")
