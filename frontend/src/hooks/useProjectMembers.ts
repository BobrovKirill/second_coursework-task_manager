import type { ProjectMember } from '../types/project'
import type { User } from '../types/user'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

interface ProjectMemberResponse {
  project_id: number
  joined_at: string
  specialty: ProjectMember['specialty']
  role: string | null
  member?: User
  user?: User
}

function normalizeProjectMember(member: ProjectMemberResponse): ProjectMember {
  const user = member.user ?? member.member

  if (user === undefined) {
    throw new Error('Не удалось определить пользователя проекта')
  }

  return {
    project_id: member.project_id,
    joined_at: member.joined_at,
    specialty: member.specialty,
    role: member.role,
    member: user,
    user,
  }
}

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
      const data = (await apiRef.current.get(
        `/projects/${projectId}/members`,
      )) as ProjectMemberResponse[]

      setMembers(data.map(normalizeProjectMember))
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

    const newMember = (await apiRef.current.post(
      `/projects/${projectId}/members/${userId}`,
    )) as ProjectMemberResponse

    const mappedMember = normalizeProjectMember(newMember)

    setMembers(prev => [...prev, mappedMember])

    return mappedMember
  }, [hasInvalidProjectId, projectId])

  const removeMember = useCallback(async (userId: number) => {
    if (hasInvalidProjectId) {
      throw new Error('Не удалось определить проект')
    }

    await apiRef.current.delete(`/projects/${projectId}/members/${userId}`)

    setMembers(prev => prev.filter((member) => {
      const user = member.user ?? member.member

      return user.id !== userId
    }))
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
