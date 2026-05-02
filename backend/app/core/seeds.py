from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.role import Role, RolePermission
from app.models.permission import Permission

# захардкоженный список ролей
ROLES = [
    {"name": "admin", "description": "Администратор проекта"},
    {"name": "organizer", "description": "Организатор"},
    {"name": "executor", "description": "Исполнитель"},
    {"name": "analyst", "description": "Аналитик"},
    {"name": "observer", "description": "Наблюдатель"},
]

# захардкоженный список разрешений
PERMISSIONS = [
    {"name": "manage_members", "description": "Добавлять и удалять участников проекта"},
    {"name": "assign_role", "description": "Назначать роли участникам"},
    {"name": "delete_project", "description": "Удалять проект"},
    {"name": "create_task", "description": "Создавать задачи"},
    {"name": "edit_task", "description": "Редактировать задачу"},
    {"name": "delete_task", "description": "Удалять задачи"},
    {"name": "assign_assignee", "description": "Назначать исполнителя на задачу"},
    {"name": "change_status", "description": "Изменять статус задачи"},
    {"name": "change_task_type", "description": "Изменять тип задачи"},
    {"name": "view_tasks", "description": "Просматривать задачи"},
    {"name": "view_analytics", "description": "Доступ к аналитике"},
]

# захардкоженный список распределение разрешений к ролям
ROLE_PERMISSIONS = {
    "admin": [
        "manage_members", "assign_role", "delete_project",
        "create_task", "edit_task", "delete_task", "assign_assignee",
        "change_status", "change_task_type", "view_tasks", "view_analytics"
    ],
    "organizer": [
        "manage_members",
        "create_task", "edit_task", "delete_task", "assign_assignee",
        "change_status", "change_task_type", "view_tasks"
    ],
    "executor": [
        "create_task", "edit_task", "assign_assignee",
        "change_status", "change_task_type", "view_tasks"
    ],
    "analyst": [
        "create_task", "edit_task", "assign_assignee",
        "change_status", "change_task_type", "view_tasks", "view_analytics"
    ],
    "observer": [
        "view_tasks"
    ],
}

# Проверяем есть ли в базе захардкоженные данные (те что выше), если нет создаем
async def seed_roles_and_permissions(db: AsyncSession) -> None:
    result = await db.execute(select(Role))
    if result.scalars().first():
        return

    permission_map = {}
    for perm_data in PERMISSIONS:
        perm = Permission(**perm_data)
        db.add(perm)
        await db.flush()
        permission_map[perm_data["name"]] = perm

    for role_data in ROLES:
        role = Role(name=role_data["name"], description=role_data["description"])
        db.add(role)
        await db.flush()

        for perm_name in ROLE_PERMISSIONS[role_data["name"]]:
            role_perm = RolePermission(
                role_id=role.id,
                permission_id=permission_map[perm_name].id
            )
            db.add(role_perm)

    await db.commit()