export interface Role {
  id: number
  name: string
  description: string
}

export interface FieldRoleProps {
  value: string
  readOnly: boolean
  onChange: (role: Role) => void
}
