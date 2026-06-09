import type { CommentAttachment } from '../../types/commentAttachment'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ImageIcon from '@mui/icons-material/Image'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'

interface CommentAttachmentsProps {
  attachments: CommentAttachment[]
  loading?: boolean
  uploading?: boolean
  deletingAttachmentId?: number | null
  error?: string | null
  canManage?: boolean
  onDelete?: (attachmentId: number) => Promise<void>
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} Б`
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} КБ`
  }

  return `${(size / 1024 / 1024).toFixed(1)} МБ`
}

function isImage(contentType: string) {
  return contentType.startsWith('image/')
}

function CommentAttachments({
  attachments,
  loading = false,
  deletingAttachmentId = null,
  error = null,
  canManage = false,
  onDelete,
}: CommentAttachmentsProps) {
  const [previewAttachment, setPreviewAttachment] = useState<CommentAttachment | null>(null)
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<number | null>(null)

  const handleClosePreview = () => {
    setPreviewAttachment(null)
  }

  const handleDownload = async (attachment: CommentAttachment) => {
    setDownloadingAttachmentId(attachment.id)

    try {
      const response = await fetch(attachment.fileUrl)

      if (!response.ok) {
        throw new Error('Не удалось скачать файл')
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = objectUrl
      link.download = attachment.originalName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    }
    catch {
      window.open(attachment.fileUrl, '_blank', 'noopener,noreferrer')
    }
    finally {
      setDownloadingAttachmentId(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ py: 1 }}>
        <CircularProgress size={16} />
      </Box>
    )
  }

  if (attachments.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        width: '100%',
        mt: 1,
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.06)',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <Stack spacing={0.75} sx={{ p: 1.5 }}>
        {error !== null && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}

        {attachments.map(attachment => (
          <Box
            key={attachment.id}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              p: 1,
              borderRadius: 2,
              border: '1px solid rgba(148, 163, 184, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          >
            {isImage(attachment.contentType)
              ? (
                  <Box
                    component="img"
                    src={attachment.fileUrl}
                    alt={attachment.originalName}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 1.5,
                      flexShrink: 0,
                    }}
                  />
                )
              : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 1.5,
                      backgroundColor: 'rgba(15, 23, 42, 0.04)',
                      flexShrink: 0,
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 20 }} />
                  </Box>
                )}

            <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isImage(attachment.contentType)
                  ? <ImageIcon sx={{ fontSize: 14 }} />
                  : <AttachFileIcon sx={{ fontSize: 14 }} />}

                <Typography
                  variant="caption"
                  fontWeight={500}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {attachment.originalName}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {formatFileSize(attachment.size)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              {isImage(attachment.contentType) && (
                <Button
                  type="button"
                  size="small"
                  onClick={() => setPreviewAttachment(attachment)}
                  sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, py: 0.25 }}
                >
                  Смотреть
                </Button>
              )}

              <Button
                type="button"
                size="small"
                onClick={() => {
                  void handleDownload(attachment)
                }}
                disabled={downloadingAttachmentId === attachment.id}
                sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, py: 0.25 }}
              >
                {downloadingAttachmentId === attachment.id ? '...' : 'Скачать'}
              </Button>

              {canManage && onDelete !== undefined && (
                <Button
                  type="button"
                  size="small"
                  color="error"
                  onClick={() => {
                    void onDelete(attachment.id)
                  }}
                  disabled={deletingAttachmentId === attachment.id}
                  sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, py: 0.25 }}
                >
                  {deletingAttachmentId === attachment.id ? '...' : 'Удалить'}
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Dialog
        open={previewAttachment !== null}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewAttachment?.originalName}
        </DialogTitle>

        <DialogContent>
          {previewAttachment !== null && (
            <Box
              component="img"
              src={previewAttachment.fileUrl}
              alt={previewAttachment.originalName}
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>

        <DialogActions>
          {previewAttachment !== null && (
            <Button
              type="button"
              onClick={() => {
                void handleDownload(previewAttachment)
              }}
              disabled={downloadingAttachmentId === previewAttachment.id}
            >
              {downloadingAttachmentId === previewAttachment.id ? 'Скачивание...' : 'Скачать'}
            </Button>
          )}

          <Button type="button" onClick={handleClosePreview}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CommentAttachments