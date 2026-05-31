import type { RoleNameType, User } from '../types/user.ts'
import type { SpecialtyType } from './specialties.ts'

export interface MemberType {
  joined_at: string
  member: User
  project_id: number
  role: RoleNameType
  specialty: SpecialtyType
}

export interface MembersState {
  members: Record<number, MemberType[]>
  loading: boolean
  error: string | null

  fetchMembers: (id: number) => Promise<MemberType[]>
  updateMember: (id: number, data: MemberType) => Promise<MemberType>
  deleteMember: (id: number, deleteId: number) => Promise<any>
  getMembers: (id: number) => MemberType[]
  addMember: (id: number, data: MemberType) => (user: any) => Promise<MemberType>
}
