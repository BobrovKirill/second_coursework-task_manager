import type { User, UserAvatar, UserState } from '../types/user.ts'
import { create } from 'zustand'
import useApi from '../hooks/useApi'
import { getStoredLastProjectId, saveLastProjectId } from '../utils/projectId.ts'

export const EMPLOYEE_TYPES = ['frontend', 'backend', 'design', 'qa', 'devops', 'manager'] as const

export const useUserStore = create<UserState>((set, get) => {
  const api = useApi()
  const endpoint = '/users/me'

  return {
    user: null,
    loading: false,
    error: null,
    lastProjectId: getStoredLastProjectId(),

    fetchUser: async () => {
      set({ loading: true, error: null })
      const projectId = get().getLastProjectId()
      const projectQuery = projectId !== null ? `?project_id=${projectId}` : ''

      try {
        const user: User = await api.get(`${endpoint}${projectQuery}`)
        set({ user })
        return user
      }
      catch (e) {
        set({ error: (e as Error).message })
      }
      finally {
        set({ loading: false })
      }
    },

    updateUser: async (data: Partial<User>) => {
      set({ loading: true, error: null })
      const projectId = get().getLastProjectId()
      const projectQuery = projectId !== null ? `?project_id=${projectId}` : ''

      try {
        const updated: User = await api.patch(`${endpoint}${projectQuery}`, data)
        set({ user: updated })
        return updated
      }
      catch (e) {
        set({ error: (e as Error).message })
        throw e
      }
      finally {
        set({ loading: false })
      }
    },

    setUser: (user: User) => set({ user }),

    getUser: (): User | null => get().user,

    clearUser: () => set({ user: null }),

    uploadAvatar: async (file: File): Promise<string> => {
      const formData = new FormData()
      formData.append('file', file)

      const data: UserAvatar = await api.post(`${endpoint}/avatar`, formData)
      return data.url
    },

    getRole: () => get().user?.role,
    getPermissions: () => get().user?.permissions,

    setLastProjectId: (projectId: number | null) => {
      saveLastProjectId(projectId)
      set({ lastProjectId: projectId })
    },

    getLastProjectId: (): number | null => {
      const state = get()
      return state.lastProjectId
    },
  }
})
