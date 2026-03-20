import {EMPLOYEE_TYPES} from "../store/useUserStory.ts";

export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
  firstName?: string
  lastName?: string
  patronymic?: string
  birthDate?: string
  position?: string
  employeeType?: EmployeeType
  avatar?: string
  projects: UserProject[]
}

export interface UserListItem {
  id: number
  username: string
  email: string
}

export type EmployeeType = typeof EMPLOYEE_TYPES[number]



export interface UserProject {
  id: number | string
  name: string
}

export interface UserState {
  user: User | null
  lastProjectId: number | null
  loading: boolean
  error: string | null

  fetchUser: () => Promise<User | null>
  updateUser: (data: Partial<User>) => Promise<User | null>
  setUser: (user: User) => Promise<User | null>
  getUser: () => User | null
  clearUser: () => void
  uploadAvatar: () => void
  setLastProjectId: (projectId: number | null) => void
  getLastProjectId: () => number | null
}