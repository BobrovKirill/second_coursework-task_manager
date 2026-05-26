import { useCallback } from 'react'
import useApi from './useApi'

export function useProjectImages(projectId: number | null) {
  const api = useApi()

  const uploadIcon = useCallback(async (file: File): Promise<string> => {
    if (!projectId)
      throw new Error('Project ID is required')

    const formData = new FormData()
    formData.append('file', file)

    const data: { url: string } = await api.post(
      `/projects/${projectId}/icon`,
      formData,
    )
    return data.url
  }, [projectId])

  const uploadBackground = useCallback(async (file: File): Promise<string> => {
    if (!projectId)
      throw new Error('Project ID is required')

    const formData = new FormData()
    formData.append('file', file)

    const data: { url: string } = await api.post(
      `/projects/${projectId}/background-image`,
      formData,
    )
    return data.url
  }, [projectId])

  const deleteIcon = useCallback(async (): Promise<void> => {
    if (!projectId)
      throw new Error('Project ID is required')
    await api.delete(`/projects/${projectId}/icon`)
  }, [projectId])

  const deleteBackground = useCallback(async (): Promise<void> => {
    if (!projectId)
      throw new Error('Project ID is required')
    await api.delete(`/projects/${projectId}/background-image`)
  }, [projectId])

  return {
    uploadIcon,
    uploadBackground,
    deleteIcon,
    deleteBackground,
  }
}
