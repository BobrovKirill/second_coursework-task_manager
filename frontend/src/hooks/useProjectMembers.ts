import type { ProjectMember } from '../types/project'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

export function useProjectMembers(projectId: number | null) {
  const [members, setMembers] = useState<ProjectMember[]>([])
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
      const data = await apiRef.current.get(`/projects/${projectId}/members`)

      const mappedData = Array.isArray(data)
        ? data.map((item: any) => ({
            ...item,
            user: item.member,
          }))
        : []

      setMembers(mappedData as ProjectMember[])
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

    const newMember = await apiRef.current.post(
      `/projects/${projectId}/members/${userId}`,
    )

    const mappedMember = {
      ...newMember,
      user: newMember.member,
    }

    setMembers(prev => [...prev, mappedMember as ProjectMember])

    return mappedMember
  }, [hasInvalidProjectId, projectId])

  const removeMember = useCallback(async (userId: number) => {
    if (hasInvalidProjectId) {
      throw new Error('Не удалось определить проект')
    }

    await apiRef.current.delete(`/projects/${projectId}/members/${userId}`)

    setMembers(prev => prev.filter(member => member.user.id !== userId))
  }, [hasInvalidProjectId, projectId])

  const assignSpecialty = useCallback(async (userId: number, specialtyId: number | null) => {
    if (hasInvalidProjectId) {
      throw new Error('Не удалось определить проект')
    }

    await apiRef.current.put(
      `/projects/${projectId}/members/${userId}/specialty`,
      { specialty_id: specialtyId },
    )

    await fetchMembers()
  }, [fetchMembers, hasInvalidProjectId, projectId])

  useEffect(() => {
    void fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
    assignSpecialty,
    refresh: fetchMembers,
  }
}
