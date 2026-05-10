import type { RoleType } from '../types/user.ts'

interface UserRoleInfo {
  title: string
  descriptionList: string[]
}

const USER_ROLES: Record<RoleType, UserRoleInfo> = {
  admin: {
    title: 'Администратор',
    descriptionList: [
      'Приглашать / добавлять / удалять пользователь',
      'Менять роль и права пользователей',
      'Создавать / удалять / редактировать проекты',
      'Создавать / удалять / редактировать задачи',
      'Назначать / снимать пользователя с задачи',
      'Изменять статус / тип / дедлайн задачи',
      'Доступ к аналитике',
    ],
  },
  organizer: {
    title: 'Организатор',
    descriptionList: [
      'Создавать / удалять / редактировать проекты',
      'Создавать / удалять / редактировать задачи',
      'Назначать / снимать пользователя с задачи',
      'Изменять статус / тип / дедлайн задачи',
    ],
  },
  executor: {
    title: 'Исполнитель',
    descriptionList: [
      'Создавать / редактировать задачи',
    ],
  },
  analyst: {
    title: 'Аналитик',
    descriptionList: [
      'Создавать / удалять / редактировать задачи',
      'Доступ к аналитике',
    ],
  },
  observer: {
    title: 'Наблюдатель',
    descriptionList: [
      'Просматривать проект',
      'Просматривать задачи',
    ],
  },
} as const

export function getDescriptionRole(roleKey: RoleType | undefined): UserRoleInfo {
  if (!roleKey || !(roleKey in USER_ROLES)) {
    return {
      title: '',
      descriptionList: [],
    }
  }

  return USER_ROLES[roleKey]
}
