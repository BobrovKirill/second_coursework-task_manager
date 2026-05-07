import type { UserListItem } from '../types/user'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

export function useProjectMembers(projectId: number | null) {
  const [members, setMembers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const apiRef = useRef(useApi())

  const hasInvalidProjectId = projectId === null || Number.isNaN(projectId)

  const fetchMembers = useCallback(async () => {
    if (hasInvalidProjectId) {
      setMembers([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response: unknown = await apiRef.current.get(`/projects/${projectId}/members`)
      const data = response as UserListItem[]

      setMembers(data)
    }
    catch (err) {
      setError(err as Error)
    }
    finally {
      setLoading(false)
    }
  }, [hasInvalidProjectId, projectId])

  const addMember = useCallback(async (userId: number) => {
    if (hasInvalidProjectId) {
      throw new Error('Не удалось определить проект')
    }

    const response: unknown = await apiRef.current.post(`/projects/${projectId}/members/${userId}`)
    const newMember = response as UserListItem

    setMembers(prev => [...prev, newMember])

    return newMember
  }, [hasInvalidProjectId, projectId])

  const removeMember = useCallback(async (userId: number) => {
    if (hasInvalidProjectId) {
      throw new Error('Не удалось определить проект')
    }

    await apiRef.current.delete(`/projects/${projectId}/members/${userId}`)
    setMembers(prev => prev.filter(member => member.id !== userId))
  }, [hasInvalidProjectId, projectId])

  useEffect(() => {
    void fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
    refresh: fetchMembers,
  }
}
