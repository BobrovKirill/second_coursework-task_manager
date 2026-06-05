export interface ProfileTask {
  id: number
  title: string
  projectId: number
  projectName: string
  status: string
  priority: number
  deadline: string | null
}

export const PROFILE_TASKS_ENDPOINT = '/tasks/me'
export const PROFILE_TASKS_ERROR_MESSAGE = 'Не удалось загрузить задачи'
