export const ROUTES = {
  AUTH: '/auth',
  MAIN: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: number | string) => `/projects/${id}`,
  PROJECT_BOARD: (id: number | string) => `/projects/${id}/board`,
  PROJECT_MEMBERS: (id: number | string) => `/projects/${id}/members`,
  PROJECT_CREATE: '/projects',
  ADD_MEMBER: '/members',
  PROFILE: '/users/me',
  CREATE_TASK_PATTERN: '/projects/:projectId/tasks/create',
  CREATE_TASK: (projectId: number | string) => `/projects/${projectId}/tasks/create`,
} as const
