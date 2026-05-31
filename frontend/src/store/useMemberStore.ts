import type { MembersState } from '../utils/members.ts'
import { create } from 'zustand'
import useApi from '../hooks/useApi'

const api = useApi()

export const useMembersStore = create<MembersState>((set, get) => ({
  members: {},
  loading: false,
  error: null,

  fetchMembers: async (projectId: number) => {
    set({ loading: true, error: null })
    try {
      const data = await api.get(`/projects/${projectId}/members`)
      set(state => ({ members: { ...state.members, [projectId]: data } }))
    }
    catch (e) {
      set({ error: (e as Error).message })
    }
    finally {
      set({ loading: false })
    }
  },

  getMembers: (projectId: number) => {
    return get().members[projectId] ?? []
  },

  invalidate: (projectId: number) => {
    set((state) => {
      const updated = { ...state.members }
      delete updated[projectId]
      return { members: updated }
    })
  },

  updateMember: (projectId: number, updatedMember: any) => {
    set(state => ({
      members: {
        ...state.members,
        [projectId]: state.members[projectId]?.map(item =>
          item.member.id === updatedMember.member.id ? updatedMember : item,
        ) ?? [],
      },
    }))
  },

  deleteMember: (projectId: number, memberId) => {
    set(state => ({
      members: {
        ...state.members,
        [projectId]: state.members[projectId]?.filter(item =>
          item.member.id !== memberId,
        ),
      },
    }))
  },

  addMember: (projectId: number, newMember) => {
    set((state) => {
      const currentMembers = state.members[projectId] || []

      return {
        members: {
          ...state.members,
          [projectId]: [...currentMembers, newMember],
        },
      }
    })
  },
}))
