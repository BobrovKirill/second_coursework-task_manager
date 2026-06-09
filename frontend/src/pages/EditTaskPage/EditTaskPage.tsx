import type { FormEvent } from 'react'
import type { TaskFormValues } from '../../components/TaskForm'
import type { Task } from '../../types/task'
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TaskAttachments from '../../components/TaskAttachments'
import { PRIORITY_MAP, TASK_TYPE_LABELS } from '../../components/TaskCard'
import TaskControlPanel from '../../components/TaskControlPanel'
import TaskDesk from '../../components/TaskDesk'
import TaskForm from '../../components/TaskForm'
import TaskComments, { type TaskCommentsHandle } from '../../components/TaskComments'
import CommentForm from '../../components/CommentForm/CommentForm'
import { getTaskColumns } from '../../constants/board'
import { ROUTES } from '../../constants/routes'
import useApi from '../../hooks/useApi'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProjectMembers } from '../../hooks/useProjectMembers'
import { useTaskAttachments } from '../../hooks/useTaskAttachments'
import { useUserStore } from '../../store/useUserStory'
import type { Comment } from '../../types/comment'
import styles from './styles.module.css'

function getTaskFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status === 'backlog' ? 'todo' : task.status,
    taskType: task.taskType ?? '',
    priority: String(task.priority),
    deadline: task.deadline?.slice(0, 10) ?? '',
    assigneeId: task.assigneeId !== null ? String(task.assigneeId) : '',
  }
}

function formatDeadline(deadline: string | null) {
  if (deadline === null || deadline === '') {
    return '—'
  }

  const date = deadline.slice(0, 10)
  const [year, month, day] = date.split('-')

  if (year === undefined || month === undefined || day === undefined) {
    return deadline
  }

  return `${day}.${month}.${year}`
}

function canDeleteTask(task: Task, userId: number | undefined, role: string | undefined) {
  if (userId === undefined) {
    return false
  }

  return role === 'admin' || role === 'organizer' || task.creatorId === userId
}

function canEditTask(task: Task, userId: number | undefined, role: string | undefined) {
  if (userId === undefined) {
    return false
  }

  return role === 'admin' || role === 'organizer' || task.creatorId === userId
}

function EditTaskPage() {
  const navigate = useNavigate()
  const { projectId, taskId } = useParams()
  const apiRef = useRef(useApi())

  const currentUser = useUserStore(state => state.user)
  const fetchUser = useUserStore(state => state.fetchUser)
  const setLastProjectId = useUserStore(state => state.setLastProjectId)

  const currentProjectId = projectId !== undefined ? Number(projectId) : null
  const currentTaskId = taskId !== undefined ? Number(taskId) : null

  const hasInvalidProjectId = currentProjectId === null || Number.isNaN(currentProjectId)
  const hasInvalidTaskId = currentTaskId === null || Number.isNaN(currentTaskId)

  const { members } = useProjectMembers(currentProjectId)

  const { columns: boardColumns } = useBoardColumns(currentProjectId)

  const {
    attachments,
    loading: attachmentsLoading,
    uploading: attachmentUploading,
    deletingAttachmentId,
    error: attachmentsError,
    uploadAttachment,
    deleteAttachment,
  } = useTaskAttachments(hasInvalidTaskId ? null : currentTaskId)

  const taskColumns = useMemo(
    () => getTaskColumns(boardColumns),
    [boardColumns],
  )

  const taskFormMembers = members.map((member) => {
    const user = member.user ?? member.member

    return {
      id: user.id,
      name: user.username ?? user.email,
    }
  })

  const [task, setTask] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskFormValues>({
    title: '',
    description: '',
    status: 'todo',
    taskType: '',
    priority: '3',
    deadline: '',
    assigneeId: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false)
  const [commentFormMode, setCommentFormMode] = useState<'new' | 'reply' | 'edit'>('new')
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [isSendingComment, setIsSendingComment] = useState(false)

  const commentsRef = useRef<TaskCommentsHandle | null>(null)

  const handleBackToBoard = () => {
    if (hasInvalidProjectId) {
      void navigate(ROUTES.PROJECTS)
      return
    }

    void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
  }

  useEffect(() => {
    if (hasInvalidProjectId) {
      return
    }

    setLastProjectId(currentProjectId)
    void fetchUser()
  }, [currentProjectId, fetchUser, hasInvalidProjectId, setLastProjectId])

  useEffect(() => {
    const loadTask = async () => {
      if (hasInvalidTaskId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = (await apiRef.current.get(`/tasks/${currentTaskId}`)) as Task

        setTask(response)
        setForm(getTaskFormValues(response))
        setIsEditing(false)
      }
      catch {
        setError('Не удалось загрузить задачу')
      }
      finally {
        setIsLoading(false)
      }
    }

    void loadTask()
  }, [currentTaskId, hasInvalidTaskId])

  const canModerateComments = useMemo(() => {
    if (!currentUser?.role) return false
    return currentUser.role === 'admin' || 
          currentUser.role === 'organizer' || 
          task?.creatorId === currentUser.id
  }, [currentUser?.role, currentUser?.id, task?.creatorId])

  const handleFormChange = (field: keyof TaskFormValues, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStartEdit = () => {
    if (task === null) {
      return
    }

    setForm(getTaskFormValues(task))
    setError(null)
    setIsEditing(true)
    handleCloseCommentForm()
  }

  const handleCancelEdit = () => {
    if (task !== null) {
      setForm(getTaskFormValues(task))
    }

    setError(null)
    setIsEditing(false)
  }

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    if (isDeleting) {
      return
    }

    setIsDeleteDialogOpen(false)
  }

  const updateTask = async () => {
    if (hasInvalidProjectId || hasInvalidTaskId || isSaving) {
      return
    }

    const title = form.title.trim()

    if (title === '') {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const updatedTask = (await apiRef.current.put(`/tasks/${currentTaskId}`, {
        title,
        description: form.description.trim() || null,
        status: form.status,
        taskType: form.taskType || null,
        priority: Number(form.priority),
        deadline: form.deadline || null,
        assigneeId: form.assigneeId !== '' ? Number(form.assigneeId) : null,
      })) as Task

      setTask(updatedTask)
      setForm(getTaskFormValues(updatedTask))
      setIsEditing(false)
    }
    catch {
      setError('Не удалось сохранить задачу')
    }
    finally {
      setIsSaving(false)
    }
  }

  const deleteTask = async () => {
    if (hasInvalidProjectId || hasInvalidTaskId || isDeleting) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await apiRef.current.delete(`/tasks/${currentTaskId}`)
      void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
    }
    catch {
      setError('Не удалось удалить задачу')
      setIsDeleteDialogOpen(false)
    }
    finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void updateTask()
  }

  const handleOpenNewCommentForm = () => {
    setCommentFormMode('new')
    setReplyToComment(null)
    setEditingComment(null)
    setIsCommentFormVisible(true)
  }

  const handleOpenReplyForm = (comment: Comment) => {
    setCommentFormMode('reply')
    setReplyToComment(comment)
    setEditingComment(null)
    setIsCommentFormVisible(true)
  }

  const handleOpenEditForm = (comment: Comment) => {
    setCommentFormMode('edit')
    setEditingComment(comment)
    setReplyToComment(null)
    setIsCommentFormVisible(true)
  }

  const handleCloseCommentForm = () => {
    setIsCommentFormVisible(false)
    setReplyToComment(null)
    setEditingComment(null)
  }

  const handleSubmitComment = async (text: string, files: File[]) => {
    if (!currentTaskId) return

    if (!text && files.length === 0) return

    setIsSendingComment(true)
    try {
      let commentId: number | undefined

      if (commentFormMode === 'edit' && editingComment) {
        await apiRef.current.put(`/comments/${editingComment.id}`, { 
          text: text || '' 
        })
        commentId = editingComment.id
      } else {
        const body: { text: string; parentId?: number } = { 
          text: text || '' 
        }
        
        if (commentFormMode === 'reply' && replyToComment) {
          body.parentId = replyToComment.id
        }
        
        const newComment = await apiRef.current.post(`/tasks/${currentTaskId}/comments`, body) as Comment
        commentId = newComment.id
      }

      if (files.length > 0 && commentId) {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          return apiRef.current.post(`/comments/${commentId}/attachments`, formData)
        })
        
        await Promise.all(uploadPromises)
      }
      
      handleCloseCommentForm()
      setError(null)
      
      if (commentsRef.current?.refreshComments) {
        await commentsRef.current.refreshComments()
      }
    } catch (err) {
      console.error('Ошибка отправки комментария:', err)
      setError('Не удалось отправить комментарий')
    } finally {
      setIsSendingComment(false)
    }
  }

  const getCommentFormPlaceholder = () => {
    switch (commentFormMode) {
      case 'reply':
        return `Ответить пользователю ${replyToComment?.author?.username ?? '...'}...`
      case 'edit':
        return 'Редактировать комментарий...'
      default:
        return 'Написать комментарий...'
    }
  }

  const getCommentFormTitle = () => {
    switch (commentFormMode) {
      case 'reply':
        return 'Ответ на комментарий'
      case 'edit':
        return 'Редактирование комментария'
      default:
        return 'Новый комментарий'
    }
  }

  if (hasInvalidProjectId || hasInvalidTaskId) {
    return (
      <Typography color="error">
        Не удалось определить задачу
      </Typography>
    )
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, minHeight: 'calc(100vh - 120px)' }}>
        <Typography>
          Загрузка задачи...
        </Typography>
      </Container>
    )
  }

  if (task === null) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, minHeight: 'calc(100vh - 120px)' }}>
        <Typography color="error">
          {error ?? 'Не удалось загрузить задачу'}
        </Typography>
      </Container>
    )
  }

  const currentStatus = task.status === 'backlog' ? 'todo' : task.status
  const statusLabel = taskColumns.find(column => column.status === currentStatus)?.title ?? currentStatus
  const taskTypeLabel = task.taskType !== null
    ? TASK_TYPE_LABELS[task.taskType] ?? task.taskType
    : '—'
  const priorityLabel = PRIORITY_MAP[task.priority] ?? String(task.priority)
  const deadlineLabel = formatDeadline(task.deadline)
  const assigneeName = task.assigneeId !== null
    ? taskFormMembers.find(member => member.id === task.assigneeId)?.name ?? `#${task.assigneeId}`
    : '—'
  const shouldShowDeleteButton = canDeleteTask(task, currentUser?.id, currentUser?.role)
  const shouldShowEditButton = canEditTask(task, currentUser?.id, currentUser?.role)

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 3,
        minHeight: 'calc(100vh - 120px)',
        paddingBottom: '100px',
      }}
    >
      {isEditing
        ? (
            <TaskForm
              title="Редактировать задачу"
              description={error ?? 'Измените поля и сохраните задачу.'}
              extraContent={(
                <TaskAttachments
                  attachments={attachments}
                  loading={attachmentsLoading}
                  uploading={attachmentUploading}
                  deletingAttachmentId={deletingAttachmentId}
                  error={attachmentsError}
                  canManage={shouldShowEditButton}
                  onUpload={uploadAttachment}
                  onDelete={deleteAttachment}
                />
              )}
              values={form}
              columns={taskColumns}
              members={taskFormMembers}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              submitLabel={isSaving ? 'Сохранение...' : 'Сохранить задачу'}
              onCancel={handleCancelEdit}
              cancelLabel="Отмена"
            />
          )
        : (
            <div className={styles.taskViewContainer}>
              <div className={`${styles.contentWrapper} ${isCommentFormVisible ? styles.contentWrapperShifted : ''}`}>
                <div className={styles.taskBlock}>
                  <Stack spacing={2} sx={{ width: '100%' }}>
                    <TaskDesk
                      title={task.title}
                      description={task.description}
                      error={error}
                      canDelete={shouldShowDeleteButton}
                      onDeleteTask={handleOpenDeleteDialog}
                      extraContent={(
                        <TaskAttachments
                          attachments={attachments}
                          loading={attachmentsLoading}
                          error={attachmentsError}
                        />
                      )}
                    />
                  </Stack>
                </div>

                <div className={styles.commentsSection}>
                  <TaskComments
                    ref={commentsRef}
                    taskId={currentTaskId!}
                    currentUserId={currentUser?.id ?? 0}
                    onNewComment={handleOpenNewCommentForm}
                    onReplyComment={handleOpenReplyForm}
                    onEditComment={handleOpenEditForm}
                    canModerateComments={canModerateComments}
                  />
                </div>
              </div>

              <div className={`${styles.commentFormPanel} ${isCommentFormVisible ? styles.commentFormPanelVisible : ''}`}>
                <div className={styles.commentFormPanelHeader}>
                  <Typography variant="h6" className={styles.commentFormTitle}>
                    {getCommentFormTitle()}
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleCloseCommentForm}
                    className={styles.closeButton}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className={styles.commentFormPanelContent}>
                  {replyToComment && (
                    <div className={styles.replyInfo}>
                      <Typography variant="caption" color="text.secondary">
                        В ответ на комментарий от {replyToComment.author?.username}
                      </Typography>
                      <Typography variant="body2" className={styles.replyText}>
                        {replyToComment.text.slice(0, 100)}
                        {replyToComment.text.length > 100 ? '...' : ''}
                      </Typography>
                    </div>
                  )}

                  <CommentForm
                    onSubmit={(text, files) => void handleSubmitComment(text, files)}
                    onCancel={handleCloseCommentForm}
                    isSending={isSendingComment}
                    placeholder={getCommentFormPlaceholder()}
                    initialText={editingComment?.text ?? ''}
                  />
                </div>
              </div>

              <div className={styles.bottomPanel}>
                <TaskControlPanel
                  statusLabel={statusLabel}
                  taskTypeLabel={taskTypeLabel}
                  priorityLabel={priorityLabel}
                  deadlineLabel={deadlineLabel}
                  assigneeName={assigneeName}
                  canEdit={shouldShowEditButton}
                  onEditTask={handleStartEdit}
                  onBackToBoard={handleBackToBoard}
                />
              </div>

              <Dialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
              >
                <DialogTitle>
                  Удалить задачу?
                </DialogTitle>

                <DialogContent>
                  <DialogContentText>
                    Задача будет удалена из проекта. Это действие нельзя будет отменить.
                  </DialogContentText>
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={handleCloseDeleteDialog}
                    disabled={isDeleting}
                  >
                    Отмена
                  </Button>

                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      void deleteTask()
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Удаление...' : 'Удалить'}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          )}
    </Container>
  )
}

export default EditTaskPage