import { useState, useEffect, useCallback } from 'react'
import useApi from '../hooks/useApi'
import type { UserListItem } from '../types/user'

export const useProjectMembers = (projectId: number) => {
  const [members, setMembers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const api = useApi()

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data: UserListItem[] = await api.get(`/projects/${projectId}/members`)
      setMembers(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const addMember = useCallback(async (userId: number) => {
    try {
      const newMember: UserListItem = await api.post(`/projects/${projectId}/members/${userId}`)
      setMembers(prev => [...prev, newMember])
      return newMember
    } catch (err) {
      throw err
    }
  }, [projectId])

  const removeMember = useCallback(async (userId: number) => {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`)
      setMembers(prev => prev.filter(m => m.id !== userId))
    } catch (err) {
      throw err
    }
  }, [projectId])

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