import { create } from 'zustand'
import useApi from '../hooks/useApi'
import type {User, UserState} from "../types/user.ts";
import {getStoredLastProjectId, saveLastProjectId} from "../utils/projectId.ts"


export const EMPLOYEE_TYPES = ['frontend', 'backend', 'design', 'qa', 'devops', 'manager'] as const

export const useUserStore = create<UserState>((set, get) => {
  const api = useApi()

  return {
    user: null,
    loading: false,
    error: null,
    lastProjectId: getStoredLastProjectId(),

    fetchUser: async () => {
      set({ loading: true, error: null })
      try {
        const user: User = await api.get('/users/me')
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
      try {
        const updated: User = await api.patch('/users/me', data)
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

    uploadAvatar: () => {},

    setLastProjectId: (projectId: number | null) => {
      saveLastProjectId(projectId)
      set({ lastProjectId: projectId })
    },

    getLastProjectId: (): number | null => {
      const state = get()
      return state.lastProjectId
    }
  }
})