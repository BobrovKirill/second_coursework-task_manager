export const ROUTES = {
  AUTH: '/auth',
  MAIN: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: number | string) => `/projects/${id}`,
  PROJECT_BOARD: (id: number | string) => `/projects/${id}/board`,
  PROJECT_MEMBERS: `/members`,
  PROJECT_CREATE: '/projects',
  ADD_MEMBER: '/members',
} as const;
