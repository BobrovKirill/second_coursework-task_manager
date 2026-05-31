import type { RoleState, RoleType } from '../utils/roles.ts'
import { create } from 'zustand'
import useApi from '../hooks/useApi'

const api = useApi()

export const useRolesStore = create<RoleState>((set, get) => ({
  roles: [],
  loading: false,

  fetchRoles: async () => {
    if (get().roles.length > 0) {
      return
    }

    set({ loading: true })
    try {
      const data: RoleType[] = await api.get('/roles/')
      set({ roles: data })
    }
    catch (e) {
      console.error(e)
    }
    finally {
      set({ loading: false })
    }
  },

  getRoles: () => get().roles,
}))
