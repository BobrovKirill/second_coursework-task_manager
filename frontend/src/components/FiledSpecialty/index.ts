export interface FieldSpecialtyProps {
  projectId: number
  data: { value: string | number, hexColor: string | null }
  readOnly: boolean
  onChange: (val: { value: string | number, hexColor: string | null }) => void
}
