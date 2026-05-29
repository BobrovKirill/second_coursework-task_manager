import type { BoardColumnProps } from './index'
import { Box, Paper, Typography } from '@mui/material'
import { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'
import TaskCard from '../TaskCard'
import styles from './style.module.css'

function restoreDraggedElement(event: Sortable.SortableEvent) {
  const oldIndex = event.oldIndex

  if (oldIndex === undefined) {
    return
  }

  const referenceElement = event.from.children[oldIndex] ?? null

  event.from.insertBefore(event.item, referenceElement)
}

function BoardColumn({
  column,
  tasks,
  members = [],
  onTaskStatusChange,
  canMoveTask = () => false,
}: BoardColumnProps) {
  const tasksRef = useRef<HTMLDivElement | null>(null)
  const dragResetTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const tasksElement = tasksRef.current

    if (tasksElement === null) {
      return
    }

    const sortable = Sortable.create(tasksElement, {
      group: 'project-board-tasks',
      animation: 150,
      sort: false,
      draggable: `.${styles.taskItem}`,
      filter: '[data-can-drag="false"], [data-can-drag="false"] *',
      preventOnFilter: false,
      ghostClass: styles.dragGhost,
      chosenClass: styles.dragChosen,
      emptyInsertThreshold: 24,
      onStart: (event) => {
        event.item.dataset.isDragging = 'true'
      },
      onEnd: (event) => {
        const taskId = Number(event.item.dataset.taskId)
        const nextStatus = event.to.dataset.columnStatus
        const previousStatus = event.from.dataset.columnStatus
        const canDrag = event.item.dataset.canDrag === 'true'

        if (dragResetTimeoutRef.current !== null) {
          window.clearTimeout(dragResetTimeoutRef.current)
        }

        dragResetTimeoutRef.current = window.setTimeout(() => {
          delete event.item.dataset.isDragging
          dragResetTimeoutRef.current = null
        }, 100)

        if (
          !canDrag
          || Number.isNaN(taskId)
          || nextStatus === undefined
          || nextStatus === previousStatus
        ) {
          return
        }

        restoreDraggedElement(event)
        void onTaskStatusChange(taskId, nextStatus)
      },
    })

    return () => {
      if (dragResetTimeoutRef.current !== null) {
        window.clearTimeout(dragResetTimeoutRef.current)
        dragResetTimeoutRef.current = null
      }

      sortable.destroy()
    }
  }, [column.status, onTaskStatusChange])

  return (
    <Paper elevation={0} className={styles.column}>
      <Typography variant="subtitle1" className={styles.title}>
        {column.title}
      </Typography>

      <Box
        ref={tasksRef}
        className={styles.tasks}
        data-column-status={column.status}
      >
        {tasks.length === 0
          ? (
              <Box className={styles.empty}>
                <Typography variant="body2" color="text.secondary">
                  Нет задач
                </Typography>
              </Box>
            )
          : (
              tasks.map((task) => {
                const canDrag = canMoveTask(task)

                return (
                  <Box
                    key={task.id}
                    className={styles.taskItem}
                    data-task-id={task.id}
                    data-can-drag={canDrag}
                  >
                    <TaskCard
                      task={task}
                      members={members}
                    />
                  </Box>
                )
              })
            )}
      </Box>
    </Paper>
  )
}

export default BoardColumn
