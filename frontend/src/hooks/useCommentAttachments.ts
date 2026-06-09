import type { CommentAttachment } from '../types/commentAttachment'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

interface UseCommentAttachmentsResult {
  attachments: CommentAttachment[]
  loading: boolean
  uploading: boolean
  deletingAttachmentId: number | null
  error: string | null
  refreshAttachments: () => Promise<void>
  uploadAttachment: (file: File) => Promise<void>
  deleteAttachment: (attachmentId: number) => Promise<void>
}

export function useCommentAttachments(commentId: number | null): UseCommentAttachmentsResult {
  const apiRef = useRef(useApi())

  const [attachments, setAttachments] = useState<CommentAttachment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadAttachments = useCallback(async () => {
    if (commentId === null) {
      setAttachments([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = (await apiRef.current.get(`/comments/${commentId}/attachments`)) as CommentAttachment[]
      setAttachments(response)
    }
    catch {
      setError('Не удалось загрузить вложения')
    }
    finally {
      setLoading(false)
    }
  }, [commentId])

  const uploadAttachment = useCallback(async (file: File) => {
    if (commentId === null) {
      setError('Не удалось определить комментарий')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadedAttachment = (await apiRef.current.post(
        `/comments/${commentId}/attachments`,
        formData,
      )) as CommentAttachment

      setAttachments(prev => [...prev, uploadedAttachment])
    }
    catch {
      setError('Не удалось загрузить вложение')
    }
    finally {
      setUploading(false)
    }
  }, [commentId])

  const deleteAttachment = useCallback(async (attachmentId: number) => {
    if (commentId === null) {
      setError('Не удалось определить комментарий')
      return
    }

    setDeletingAttachmentId(attachmentId)
    setError(null)

    try {
      await apiRef.current.delete(`/comments/${commentId}/attachments/${attachmentId}`)
      setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId))
    }
    catch {
      setError('Не удалось удалить вложение')
    }
    finally {
      setDeletingAttachmentId(null)
    }
  }, [commentId])

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