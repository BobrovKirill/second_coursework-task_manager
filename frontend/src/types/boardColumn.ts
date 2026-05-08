export interface BoardColumn {
  id: number
  projectId: number
  title: string
  position: number
}

export interface BoardColumnUpdate {
  id?: number
  title?: string
  position?: number
}