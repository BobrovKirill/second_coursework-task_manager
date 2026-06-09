import { Box, Typography, Avatar, IconButton } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import type { Comment } from '../../types/comment'
import { formatCommentDate } from '../../utils/dateUtils'
import CommentAttachments from '../CommentAttachments/CommentAttachments'
import { useCommentAttachments } from '../../hooks/useCommentAttachments'
import styles from './styles.module.css'

interface CommentItemProps {
  comment: Comment
  currentUserId: number
  parentAuthorName: string | null
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  onParentClick?: () => void
  canModerate?: boolean
}

function CommentItem({
  comment,
  currentUserId,
  parentAuthorName,
  onReply,
  onEdit,
  onDelete,
  onParentClick,
  canModerate = false,
}: CommentItemProps) {
  const isOwner = comment.authorId === currentUserId
  const isEdited = comment.createdAt !== comment.updatedAt
  const canEdit = isOwner
  const canDelete = isOwner || canModerate

  const {
    attachments,
    loading: attachmentsLoading,
    uploading: attachmentsUploading,
    deletingAttachmentId,
    error: attachmentsError,
    deleteAttachment,
  } = useCommentAttachments(comment.id)

  return (
    <Box className={styles.commentItem}>
      {parentAuthorName && (
        <Box className={styles.parentInfo} onClick={onParentClick}>
          <SubdirectoryArrowRightIcon className={styles.parentIcon} />
          <Typography variant="caption" className={styles.parentText}>
            Ответ на комментарий от {parentAuthorName}
          </Typography>
        </Box>
      )}

      <Box className={styles.commentContent}>
        <Avatar className={styles.avatar}>
          {comment.author?.username?.charAt(0).toUpperCase() ?? '?'}
        </Avatar>

        <Box className={styles.commentBody}>
          <Box className={styles.commentHeader}>
            <Box className={styles.authorInfo}>
              <Typography variant="subtitle2" className={styles.authorName}>
                {comment.author?.username ?? 'Неизвестный пользователь'}
              </Typography>
              {comment.author?.email && (
                <Typography variant="caption" className={styles.authorEmail}>
                  {comment.author.email}
                </Typography>
              )}
            </Box>
            <Typography variant="caption" className={styles.commentDate}>
              {isEdited ? 'Изменено ' : ''}{formatCommentDate(comment.updatedAt)}
            </Typography>
          </Box>

          {comment.text && (
            <Typography variant="body2" className={styles.commentText}>
              {comment.text}
            </Typography>
          )}

          <CommentAttachments
            attachments={attachments}
            loading={attachmentsLoading}
            uploading={attachmentsUploading}
            deletingAttachmentId={deletingAttachmentId}
            error={attachmentsError}
            canManage={isOwner}
            onDelete={deleteAttachment}
          />

          <Box className={styles.commentActions}>
            <IconButton
              size="small"
              onClick={onReply}
              className={styles.actionButton}
              title="Ответить"
            >
              <ReplyIcon fontSize="small" />
            </IconButton>

            {canEdit && (
              <IconButton
                size="small"
                onClick={onEdit}
                className={styles.actionButton}
                title="Редактировать"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}

            {canDelete && (
              <IconButton
                size="small"
                onClick={onDelete}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title={isOwner ? 'Удалить' : 'Удалить (модератор)'}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CommentItem