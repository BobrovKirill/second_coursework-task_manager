import type { TaskAttachment } from '../types/taskAttachment'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

interface UseTaskAttachmentsResult {
  attachments: TaskAttachment[]
  loading: boolean
  uploading: boolean
  deletingAttachmentId: number | null
  error: string | null
  refreshAttachments: () => Promise<void>
  uploadAttachment: (file: File) => Promise<void>
  deleteAttachment: (attachmentId: number) => Promise<void>
}

export function useTaskAttachments(taskId: number | null): UseTaskAttachmentsResult {
  const apiRef = useRef(useApi())

  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadAttachments = useCallback(async () => {
    if (taskId === null) {
      setAttachments([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = (await apiRef.current.get(`/tasks/${taskId}/attachments/`)) as TaskAttachment[]
      setAttachments(response)
    }
    catch {
      setError('Не удалось загрузить вложения')
    }
    finally {
      setLoading(false)
    }
  }, [taskId])

  const uploadAttachment = useCallback(async (file: File) => {
    if (taskId === null) {
      setError('Не удалось определить задачу')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadedAttachment = (await apiRef.current.post(
        `/tasks/${taskId}/attachments/`,
        formData,
      )) as TaskAttachment

      setAttachments(prev => [uploadedAttachment, ...prev])
    }
    catch {
      setError('Не удалось загрузить вложение')
    }
    finally {
      setUploading(false)
    }
  }, [taskId])

  const deleteAttachment = useCallback(async (attachmentId: number) => {
    if (taskId === null) {
      setError('Не удалось определить задачу')
      return
    }

    setDeletingAttachmentId(attachmentId)
    setError(null)

    try {
      await apiRef.current.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
      setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId))
    }
    catch {
      setError('Не удалось удалить вложение')
    }
    finally {
      setDeletingAttachmentId(null)
    }
  }, [taskId])

  useEffect(() => {
    void loadAttachments()
  }, [loadAttachments])

  return {
    attachments,
    loading,
    uploading,
    deletingAttachmentId,
    error,
    refreshAttachments: loadAttachments,
    uploadAttachment,
    deleteAttachment,
  }
}
