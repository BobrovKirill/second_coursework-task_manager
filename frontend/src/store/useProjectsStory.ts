import type {
  ProjectListItem,
  ProjectState,
} from '../types/project.ts'
import { create } from 'zustand'
import useApi from '../hooks/useApi'

const api = useApi()

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects: ProjectListItem[] = await api.get('/projects/')
      set({ projects })
      return projects
    }
    catch (e) {
      set({ error: (e as Error).message })
    }
    finally {
      set({ loading: false })
    }
  },

  updateProjectsStore: async () => {
    await get().fetchProjects()
  },

  getProjects: () => get().projects,
}))
