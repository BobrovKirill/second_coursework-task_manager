import { useState, useEffect, useCallback } from 'react'
import { projectsApi } from '../services/project'
import type { UserListItem } from '../types/user'

export const useProjectMembers = (projectId: number) => {
  const [members, setMembers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await projectsApi.getMembers(projectId)
      setMembers(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const addMember = async (userId: number) => {
    try {
      const { data: newMember } = await projectsApi.addMember(projectId, userId)
      setMembers(prev => [...prev, newMember])
      return newMember
    } catch (err) {
      throw err
    }
  }

  const removeMember = async (userId: number) => {
    try {
      await projectsApi.removeMember(projectId, userId)
      setMembers(prev => prev.filter(m => m.id !== userId))
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
    refresh: fetchMembers
  }
}