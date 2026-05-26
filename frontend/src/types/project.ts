import type { ProjectSpecialty } from './projectSpecialty'
import type { UserListItem } from './user'

export type BackgroundType = 'default' | 'color' | 'gradient' | 'image'

export interface Project {
  id: number
  name: string
  description: string | null
  owner_id: number
  created_at: string
  updated_at: string
  is_active: boolean
  icon_url: string | null
  font_color: string
  background_type: BackgroundType
  background_value: string | null
}

export interface ProjectMember {
  project_id: number
  user: UserListItem
  joined_at: string
  specialty: ProjectSpecialty | null
  role: string | null
}
export interface ProjectWithMembers extends Project {
  members: ProjectMember[]
}

export interface ProjectCreate {
  name: string
  description?: string
}

export interface ProjectUpdate {
  name?: string
  description?: string
  icon_url?: string | null
  font_color?: string
  background_type?: BackgroundType
  background_value?: string | null
}

export interface ProjectListItem extends Project {
  member_count: number
}

export interface ProjectState {
  projects: ProjectListItem[]
  currentProject: ProjectWithMembers | null
  loading: boolean
  error: string | null

  fetchProjects: () => Promise<void>
  updateProjectsStore: () => Promise<void>
  getProjects: () => ProjectListItem[]
}
