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

export interface MemberWithSpecialty {
  id: number
  username: string
  email: string
  specialty_id: number | null
  specialty_name: string | null
  specialty_hex_color: string | null
}