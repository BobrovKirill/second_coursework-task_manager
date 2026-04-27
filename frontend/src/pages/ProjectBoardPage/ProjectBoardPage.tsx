import type { FormEvent } from 'react'
import type { TaskFormValues } from '../../components/TaskForm'
import type { Task } from '../../mocks/boardMock'
import { Box } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import BoardColumn from '../../components/BoardColumn'
import { mockColumns, mockMembers } from '../../mocks/boardMock'
import { useTasksStore } from '../../store/tasks'

function ProjectBoardPage() {
  const { id, projectId } = useParams()
  const currentProjectId = Number(projectId ?? id ?? 1)

  const tasks = useTasksStore(state => state.tasks)
  const updateTask = useTasksStore(state => state.updateTask)
  const deleteTask = useTasksStore(state => state.deleteTask)
  const moveTask = useTasksStore(state => state.moveTask)

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

  const [form, setForm] = useState<TaskFormValues>({
    title: '',
    description: '',
    columnId: String(mockColumns[0]?.id ?? 101),
    type: 'frontend',
    priorityId: '3',
    deadline: '',
    assigneeId: '',
  })

  const sortedColumns = useMemo(
    () => mockColumns.toSorted((a, b) => a.position - b.position),
    [],
  )

  const resetForm = useCallback(() => {
    setForm({
      title: '',
      description: '',
      columnId: String(sortedColumns[0]?.id ?? 101),
      type: 'frontend',
      priorityId: '3',
      deadline: '',
      assigneeId: '',
    })

    setEditingTaskId(null)
  }, [sortedColumns])

  const handleFormChange = useCallback(
    (field: keyof TaskFormValues, value: string) => {
      setForm(prev => ({
        ...prev,
        [field]: value,
      }))
    },
    [],
  )

  const handleChangeTaskColumn = useCallback(
    (taskId: number, newColumnId: number) => {
      moveTask(taskId, newColumnId)
    },
    [moveTask],
  )

  const handleStartEdit = useCallback((task: Task) => {
    setEditingTaskId(task.id)

    setForm({
      title: task.title,
      description: task.description,
      columnId: String(task.columnId),
      type: task.type,
      priorityId: String(task.priorityId),
      deadline: task.deadline ?? '',
      assigneeId: task.assigneeIds[0] ? String(task.assigneeIds[0]) : '',
    })
  }, [])

  const handleDeleteTask = useCallback((taskId: number) => {
    deleteTask(taskId)

    if (editingTaskId === taskId) {
      resetForm()
    }
  }, [deleteTask, editingTaskId, resetForm])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (editingTaskId === null) {
      return
    }

    const title = form.title.trim()
    if (!title)
      return

    updateTask(editingTaskId, {
      columnId: Number(form.columnId),
      type: form.type as Task['type'],
      title,
      description: form.description.trim(),
      priorityId: Number(form.priorityId),
      deadline: form.deadline || null,
      assigneeIds: form.assigneeId ? [Number(form.assigneeId)] : [],
    })

    resetForm()
  }

  return (
    <div>
      {/* <Box sx={{ mb: 3 }}> */}
      {/*  <TaskForm */}
      {/*    title="Редактировать задачу" */}
      {/*    values={form} */}
      {/*    columns={sortedColumns} */}
      {/*    members={mockMembers} */}
      {/*    onChange={handleFormChange} */}
      {/*    onSubmit={handleSubmit} */}
      {/*    submitLabel="Сохранить изменения" */}
      {/*    onCancel={resetForm} */}
      {/*    cancelLabel="Отмена" */}
      {/*  /> */}
      {/* </Box> */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(250px, 1fr))',
          gap: 1.5,
          alignItems: 'stretch',
          height: '100%',

          overflowX: 'auto',
          overflowY: 'hidden',

          minWidth: '100%',

          paddingBottom: '12px',
        }}
      >
        {sortedColumns.map((column) => {
          const columnTasks = tasks.filter(
            task => task.projectId === currentProjectId && task.columnId === column.id,
          )

          return (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              members={mockMembers}
              columns={sortedColumns}
              onChangeTaskColumn={handleChangeTaskColumn}
              onEditTask={handleStartEdit}
              onDeleteTask={handleDeleteTask}
            />
          )
        })}
      </Box>
    </div>
  )
}

export default ProjectBoardPage
