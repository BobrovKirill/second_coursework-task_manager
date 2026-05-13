import { useState, useEffect, useCallback } from 'react'
import useApi from './useApi'
import type { MemberWithSpecialty } from '../types/projectSpecialty'

export const useProjectMembers = (projectId: number) => {
  const [members, setMembers] = useState<MemberWithSpecialty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const api = useApi()

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data: MemberWithSpecialty[] = await api.get(
        `/projects/${projectId}/members-with-specialties`
      )
      setMembers(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const addMember = useCallback(async (userId: number) => {
    try {
      const newMember: MemberWithSpecialty = await api.post(
        `/projects/${projectId}/members/${userId}`
      )
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

  const assignSpecialty = useCallback(async (userId: number, specialtyId: number | null) => {
    try {
      await api.put(
        `/projects/${projectId}/members/${userId}/specialty`,
        { specialty_id: specialtyId }
      )
      await fetchMembers()
    } catch (err) {
      throw err
    }
  }, [projectId, fetchMembers])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
    assignSpecialty,
    refresh: fetchMembers
  }
}