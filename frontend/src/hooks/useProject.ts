import { useState, useEffect, useCallback } from 'react'
import { projectsApi } from '../services/project'
import type {ProjectWithMembers, ProjectUpdate } from '../types/project'

export const useProject = (projectId: number) => {
  const [project, setProject] = useState<ProjectWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProject = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await projectsApi.getById(projectId)
      setProject(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const updateProject = async (data: ProjectUpdate) => {
    try {
      const { data: updated } = await projectsApi.update(projectId, data)
      setProject(prev => prev ? { ...prev, ...updated } : null)
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    updateProject,
    refresh: fetchProject
  }
}