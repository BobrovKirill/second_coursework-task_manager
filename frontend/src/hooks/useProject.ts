import { useState, useEffect, useCallback } from 'react'
import useApi from '../hooks/useApi'
import type { ProjectWithMembers, ProjectUpdate } from '../types/project'
import type { BoardColumn, BoardColumnUpdate } from '../types/boardColumn'
import { useUserStore } from '../store/useUserStory'

export const useProject = (projectId: number) => {
  const [project, setProject] = useState<ProjectWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const api = useApi()
  const { setLastProjectId } = useUserStore()

  useEffect(() => {
    if (projectId) {
      setLastProjectId(projectId)
    }
  }, [projectId, setLastProjectId])

  const fetchProject = useCallback(async () => {
    setLoading(true)
    try {
      const data: ProjectWithMembers = await api.get(`/projects/${projectId}`)
      setProject(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const updateProject = useCallback(async (data: ProjectUpdate) => {
    try {
      const updated: ProjectWithMembers = await api.put(`/projects/${projectId}`, data)
      setProject(prev => prev ? { ...prev, ...updated } : null)
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [projectId])

  const updateColumns = useCallback(async (columns: BoardColumnUpdate[]) => {
    try {
      const updated: BoardColumn[] = await api.put(
        `/projects/${projectId}/columns/batch`, 
        columns
      )
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [projectId])


  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    updateProject,
    updateColumns,
    refresh: fetchProject
  }
}