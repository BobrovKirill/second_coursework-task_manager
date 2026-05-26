import type { ProjectSpecialty, ProjectSpecialtyCreate, ProjectSpecialtyUpdate } from '../types/projectSpecialty'
import { useCallback, useEffect, useState } from 'react'
import useApi from './useApi'

export function useProjectSpecialties(projectId: number) {
  const [specialties, setSpecialties] = useState<ProjectSpecialty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const api = useApi()

  const fetchSpecialties = useCallback(async () => {
    setLoading(true)
    try {
      const data: ProjectSpecialty[] = await api.get(`/projects/${projectId}/specialties`)
      setSpecialties(data)
    }
    catch (err) {
      setError(err as Error)
    }
    finally {
      setLoading(false)
    }
  }, [projectId])

  const createSpecialty = useCallback(async (data: ProjectSpecialtyCreate) => {
    try {
      const newSpecialty: ProjectSpecialty = await api.post(
        `/projects/${projectId}/specialties`,
        data,
      )
      setSpecialties(prev => [...prev, newSpecialty])
      return newSpecialty
    }
    catch (err) {
      throw err
    }
  }, [projectId])

  const updateSpecialty = useCallback(async (
    specialtyId: number,
    data: ProjectSpecialtyUpdate,
  ) => {
    try {
      const updated: ProjectSpecialty = await api.put(
        `/projects/${projectId}/specialties/${specialtyId}`,
        data,
      )
      setSpecialties(prev =>
        prev.map(s => (s.id === specialtyId ? updated : s)),
      )
      return updated
    }
    catch (err) {
      throw err
    }
  }, [projectId])

  const deleteSpecialty = useCallback(async (specialtyId: number) => {
    try {
      await api.delete(`/projects/${projectId}/specialties/${specialtyId}`)
      setSpecialties(prev => prev.filter(s => s.id !== specialtyId))
    }
    catch (err) {
      throw err
    }
  }, [projectId])

  useEffect(() => {
    fetchSpecialties()
  }, [fetchSpecialties])

  return {
    specialties,
    loading,
    error,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    refresh: fetchSpecialties,
  }
}
