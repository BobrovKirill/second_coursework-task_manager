import { useState, useEffect, useCallback } from 'react'
import useApi from './useApi'
import type { BoardColumn } from '../types/boardColumn'

export const useBoardColumns = (projectId: number) => {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const api = useApi()

  const fetchColumns = useCallback(async () => {
    if (!projectId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data: BoardColumn[] = await api.get(`/projects/${projectId}/columns`)
      setColumns(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchColumns()
  }, [fetchColumns])

  return {
    columns,
    loading,
    error,
    refresh: fetchColumns
  }
}