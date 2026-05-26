export interface ProjectSpecialty {
  id: number
  project_id: number
  name: string
  hex_color: string
}

export interface ProjectSpecialtyCreate {
  name: string
  hex_color: string
}

export interface ProjectSpecialtyUpdate {
  name?: string
  hex_color?: string
}
