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
      const data: unknown = await apiRef.current.get(`/projects/${projectId}/tasks`)
      setTasks(normalizeTasks(data))
    }
    catch {
      setError('Не удалось загрузить задачи проекта')
    }
    finally {
      setLoading(false)
    }
  }, [projectId])

  const deleteTask = useCallback(async (taskId: number) => {
    setError(null)

    try {
      await apiRef.current.delete(`/tasks/${taskId}`)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }
    catch {
      setError('Не удалось удалить задачу')
    }
  }, [])

  const updateTaskStatus = useCallback(async (taskId: number, status: string) => {
    const currentTask = tasks.find(task => task.id === taskId)

    if (currentTask === undefined || currentTask.status === status) {
      return
    }

    const previousTasks = tasks

    setError(null)
    setTasks(prev => prev.map(task => (
      task.id === taskId
        ? { ...task, status }
        : task
    )))

    try {
      const updatedTask = await apiRef.current.put(`/tasks/${taskId}`, {
        status,
      }) as Task

      setTasks(prev => prev.map(task => (
        task.id === taskId
          ? updatedTask
          : task
      )))
    }
    catch {
      setError('Не удалось изменить статус задачи')
      setTasks(previousTasks)
      void fetchTasks()
    }
  }, [fetchTasks, tasks])

  useEffect(() => {
    void fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    deleteTask,
    updateTaskStatus,
  }
}
