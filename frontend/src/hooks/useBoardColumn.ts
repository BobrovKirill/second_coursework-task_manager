import type { BoardColumn } from '../types/boardColumn'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

function normalizeColumns(data: unknown): BoardColumn[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data as BoardColumn[]
}

export function useBoardColumns(projectId: number | null) {
  const apiRef = useRef(useApi())
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchColumns = useCallback(async () => {
    if (projectId === null || Number.isNaN(projectId)) {
      setColumns([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data: unknown = await apiRef.current.get(`/projects/${projectId}/columns`)
      setColumns(normalizeColumns(data))
    }
    catch (err) {
      setError(err as Error)
    }
    finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void fetchColumns()
  }, [fetchColumns])

  return {
    columns,
    loading,
    error,
    refresh: fetchColumns,
  }
}
