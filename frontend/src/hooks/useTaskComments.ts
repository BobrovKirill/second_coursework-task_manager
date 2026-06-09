import { useState, useCallback } from 'react'
import useApi from './useApi'
import type { Comment, CommentCreate, CommentUpdate } from '../types/comment'

export const useTaskComments = (taskId: number | null) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isSending, setIsSending] = useState(false)
  
  const api = useApi()

  const fetchComments = useCallback(async () => {
    if (!taskId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await api.get(`/tasks/${taskId}/comments`)
      setComments(data as Comment[])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const createComment = useCallback(async (data: CommentCreate) => {
    if (!taskId) throw new Error('Task ID is required')
    
    setIsSending(true)
    setError(null)
    
    try {
      await api.post(`/tasks/${taskId}/comments`, data)
      await fetchComments()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsSending(false)
    }
  }, [taskId, fetchComments])

  const updateComment = useCallback(async (commentId: number, data: CommentUpdate) => {
    setError(null)
    
    try {
      await api.put(`/comments/${commentId}`, data)
      await fetchComments()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [fetchComments])

  const deleteComment = useCallback(async (commentId: number) => {
    setError(null)
    
    try {
      await api.delete(`/comments/${commentId}`)
      await fetchComments()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [fetchComments])

  return {
    comments,
    loading,
    error,
    isSending,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  }
}