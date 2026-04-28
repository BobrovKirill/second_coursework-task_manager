import type { Task } from '../types/task'
import { useCallback, useEffect, useRef, useState } from 'react'
import useApi from './useApi'

function normalizeTasks(data: unknown): Task[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data as Task[]
}

export function useTasks(projectId: number | null) {
  const apiRef = useRef(useApi())

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (projectId === null || Number.isNaN(projectId)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data: unknown = await apiRef.current.get(`/tasks/projects/${projectId}`)
      setTasks(normalizeTasks(data))
    }
    catch {
      setError('Не удалось загрузить задачи проекта')
    }
    finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
  }
}
