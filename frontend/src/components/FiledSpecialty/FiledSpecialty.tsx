import type { FieldSpecialtyProps } from './index.ts'
import { CircularProgress, MenuItem, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useSpecialtiesStore } from '../../store/useSpecialtyStore.ts'
import base from '../../styles/formBase.module.css'
import styles from './style.module.css'

function FiledSpecialty({ projectId, data, readOnly, onChange }: FieldSpecialtyProps) {
  const { getSpecialties, fetchSpecialties } = useSpecialtiesStore()

  useEffect(() => {
    if (getSpecialties(projectId).length === 0) {
      void fetchSpecialties(projectId)
    }
  }, [])

  const specialties = getSpecialties(projectId)

  return (
    <TextField
      select
      label="Должность на проекте"
      value={data.value}
      fullWidth
      className={`${base.field} ${styles.fullWidth}`}
      InputProps={{
        readOnly,
        endAdornment: data.hexColor
          ? (
              <div className={styles.color} style={{ backgroundColor: data.hexColor, marginRight: '24px' }} />
            )
          : null,
      }}
      sx={{
        '& .MuiSelect-select': {
          padding: '12px 16px',
        },
      }}
      onChange={e => onChange({
        value: e.target.value,
        hexColor: specialties.find(item => e.target.value === item.id)?.hex_color || null,
      })}
    >
      {specialties.length === 0
        ? (
            <MenuItem disabled>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              {' '}
              Загрузка...
            </MenuItem>
          )
        : specialties.map(role => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}
    </TextField>
  )
}

export default FiledSpecialty
