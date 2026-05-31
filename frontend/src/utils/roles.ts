export type RoleNameType = 'admin' | 'organizer' | 'executor' | 'analyst' | 'observer'

export interface RoleType {
  name: RoleNameType
  description?: string
  id?: number
}

interface UserRoleInfo {
  title: string
  descriptionList: string[]
}

export interface RoleState {
  roles: RoleType[]
  loading: boolean

  fetchRoles: () => Promise<RoleType[]>
  getRoles: () => RoleType[]
}

const USER_ROLES: Record<RoleNameType, UserRoleInfo> = {
  admin: {
    title: 'Администратор',
    descriptionList: [
      'Приглашать / добавлять / удалять пользователь',
      'Менять роль и права пользователей',
      'Создавать / удалять / редактировать проекты',
      'Создавать / удалять / редактировать задачи',
      'комментировать',
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
      'комментировать',
      'Назначать / снимать пользователя с задачи',
      'Изменять статус / тип / дедлайн задачи',
    ],
  },
  executor: {
    title: 'Исполнитель',
    descriptionList: [
      'Создавать / редактировать свои задачи',
      'комментировать',
    ],
  },
  analyst: {
    title: 'Аналитик',
    descriptionList: [
      'Создавать / удалять / редактировать свои задачи',
      'комментировать',
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

export function getDescriptionRole(roleKey: RoleNameType | undefined): UserRoleInfo {
  if (!roleKey || !(roleKey in USER_ROLES)) {
    return {
      title: '',
      descriptionList: [],
    }
  }

  return USER_ROLES[roleKey]
}
