export interface SpecialtyType {
  hex_color: string
  name: string
  id: number
  project_id: number
}

export interface SpecialtiesState {
  specialties: Record<number, SpecialtyType[]>
  loading: boolean
  error: string | null

  fetchSpecialties: (id: number) => Promise<SpecialtyType[]>
  getSpecialties: (id: number) => SpecialtyType[]
  invalidate: (id: number) => any
  // deleteMember: (id: number, deleteId: number) => Promise<any>
  // addMember: (id: number, data: SpecialtyType) => (user: any) => Promise<SpecialtyType>
}
