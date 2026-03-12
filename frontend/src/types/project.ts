import type { UserListItem } from './user'

export interface Project {
  id: number
  name: string
  description: string | null
  owner_id: number
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ProjectWithMembers extends Project {
  members: UserListItem[]
}

export interface ProjectCreate {
  name: string
  description?: string
}

export interface ProjectUpdate {
  name?: string
  description?: string
}

export interface ProjectListItem extends Project {
  member_count: number
}