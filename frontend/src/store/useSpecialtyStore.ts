import type { SpecialtiesState, SpecialtyType } from '../utils/specialties.ts'
import { create } from 'zustand'
import useApi from '../hooks/useApi'

const api = useApi()

export const useSpecialtiesStore = create<SpecialtiesState>((set, get) => ({
  specialties: {},
  loading: false,
  error: null,

  fetchSpecialties: async (projectId: number) => {
    set({ loading: true, error: null })
    try {
      const data: SpecialtyType = await api.get(`/projects/${projectId}/specialties`)
      set(state => ({ specialties: { ...state.specialties, [projectId]: data } }))
    }
    catch (e) {
      set({ error: (e as Error).message })
    }
    finally {
      set({ loading: false })
    }
  },

  getSpecialties: (projectId: number) => {
    return get().specialties[projectId] ?? []
  },

  invalidate: (projectId: number) => {
    set((state) => {
      const updated = { ...state.specialties }
      delete updated[projectId]
      return { specialties: updated }
    })
  },
}))
