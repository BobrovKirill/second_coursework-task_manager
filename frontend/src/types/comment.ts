export interface CommentAuthor {
  id: number
  username: string
  email: string
  avatarUrl?: string | null
}

export interface Comment {
  id: number
  authorId: number
  taskId: number
  parentId: number | null
  text: string
  createdAt: string
  updatedAt: string
  author: CommentAuthor | null
  replyCount: number
}

export interface CommentCreate {
  text: string
  parentId?: number | null
}

export interface CommentUpdate {
  text: string
}