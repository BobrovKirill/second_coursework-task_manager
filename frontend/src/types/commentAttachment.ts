export interface CommentAttachment {
  id: number
  commentId: number
  uploaderId: number | null
  originalName: string
  fileUrl: string
  contentType: string
  size: number
  createdAt: string
}