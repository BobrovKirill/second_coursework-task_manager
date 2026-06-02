export interface TaskAttachment {
  id: number
  taskId: number
  uploaderId: number | null
  originalName: string
  fileUrl: string
  contentType: string
  size: number
  createdAt: string
}
