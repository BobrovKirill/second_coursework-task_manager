import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import { useTaskComments } from '../../hooks/useTaskComments'
import CommentItem from '../CommentItem/CommentItem'
import type { Comment } from '../../types/comment'
import styles from './styles.module.css'

interface TaskCommentsProps {
  taskId: number
  currentUserId: number
  onNewComment?: () => void
  onReplyComment?: (comment: Comment) => void
  onEditComment?: (comment: Comment) => void
  canModerateComments?: boolean
}

export interface TaskCommentsHandle {
  refreshComments: () => Promise<void>
}

const TaskComments = forwardRef<TaskCommentsHandle, TaskCommentsProps>(
  function TaskComments({ 
    taskId, 
    currentUserId, 
    onNewComment, 
    onReplyComment, 
    onEditComment,
    canModerateComments = false,
  }, ref) {
    const {
      comments,
      loading,
      error,
      fetchComments,
      deleteComment,
    } = useTaskComments(taskId)

    const [highlightedCommentId, setHighlightedCommentId] = useState<number | null>(null)
    
    const commentsListRef = useRef<HTMLDivElement>(null)
    const commentRefs = useRef<Map<number, HTMLDivElement>>(new Map())

    useImperativeHandle(ref, () => ({
      refreshComments: async () => {
        await fetchComments()
      }
    }), [fetchComments])

    useEffect(() => {
      if (taskId) {
        void fetchComments()
      }
    }, [taskId, fetchComments])

    const scrollToComment = (commentId: number) => {
      const element = commentRefs.current.get(commentId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedCommentId(commentId)
        setTimeout(() => setHighlightedCommentId(null), 2000)
      }
    }

    const handleDeleteComment = async (commentId: number) => {
      try {
        await deleteComment(commentId)
      } catch {
        
      }
    }

    const getParentAuthorName = (parentId: number | null) => {
      if (!parentId) return null
      const parentComment = comments.find(c => c.id === parentId)
      return parentComment?.author?.username ?? 'Неизвестный пользователь'
    }

    return (
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Box className={styles.headerLeft}>
            <ChatBubbleOutlineIcon className={styles.headerIcon} />
            <Typography variant="h6" className={styles.headerTitle}>
              Комментарии ({comments.length})
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={onNewComment}
            className={styles.addButton}
          >
            Написать комментарий
          </Button>
        </Box>

        {error && (
          <Alert severity="error" className={styles.errorAlert}>
            {error.message}
          </Alert>
        )}

        <Box className={styles.content}>
          {loading ? (
            <Box className={styles.loadingContainer}>
              <CircularProgress size={32} />
            </Box>
          ) : comments.length === 0 ? (
            <Box className={styles.emptyState}>
              <ChatBubbleOutlineIcon className={styles.emptyIcon} />
              <Typography variant="body1" color="text.secondary">
                Нет комментариев. Будьте первым!
              </Typography>
            </Box>
          ) : (
            <Box ref={commentsListRef} className={styles.commentsList}>
              {comments.map(comment => (
                <Box
                  key={comment.id}
                  ref={(el: HTMLDivElement | null) => {
                    if (el) commentRefs.current.set(comment.id, el)
                  }}
                  className={`${styles.commentWrapper} ${
                    highlightedCommentId === comment.id ? styles.highlighted : ''
                  }`}
                >
                  <CommentItem
                    comment={comment}
                    currentUserId={currentUserId}
                    parentAuthorName={getParentAuthorName(comment.parentId)}
                    onReply={() => onReplyComment?.(comment)}
                    onEdit={() => onEditComment?.(comment)}
                    onDelete={() => void handleDeleteComment(comment.id)}
                    onParentClick={
                      comment.parentId
                        ? () => scrollToComment(comment.parentId!)
                        : undefined
                    }
                    canModerate={canModerateComments}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    )
  }
)

export default TaskComments