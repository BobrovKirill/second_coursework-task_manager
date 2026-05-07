import type { MemberWithSpecialty } from '../types/projectSpecialty'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

export function useProjectMembers(projectId: number | null) {
  const [members, setMembers] = useState<MemberWithSpecialty[]>([])
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
      const data: MemberWithSpecialty[] = await apiRef.current.get(
        `/projects/${projectId}/members-with-specialties`,
      )

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

    const newMember: MemberWithSpecialty = await apiRef.current.post(
      `/projects/${projectId}/members/${userId}`,
    )

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