import type { FieldRoleProps } from './index.ts'
import AnnouncementIcon from '@mui/icons-material/Announcement'
import { CircularProgress, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from '@mui/material'
import { useEffect } from 'react'
import { useRolesStore } from '../../store/useRoleStore.ts'
import base from '../../styles/formBase.module.css'
import { getDescriptionRole } from '../../utils/roles.ts'
import styles from './style.module.css'

function FieldRole({ value, readOnly, onChange }: FieldRoleProps) {
  const { fetchRoles, getRoles, roles } = useRolesStore()

  useEffect(() => {
    if (getRoles().length === 0) {
      void fetchRoles()
    }
  }, [])

  const currentRole = getDescriptionRole(value)

  return (
    <TextField
      select
      label="Роль и права на проекте"
      value={value}
      fullWidth
      className={`${base.field} ${styles.root}`}
      onChange={e => onChange(e.target.value)}
      sx={{
        '& .MuiSelect-select': {
          padding: '12px 16px',
        },
      }}
      InputProps={{
        readOnly,
        endAdornment: value && (
          <InputAdornment position="end">
            <Tooltip
              title={(
                <>
                  <div>Права пользователя:</div>
                  <ol style={{ paddingLeft: '20px', margin: '6px 0 0 0' }}>
                    {currentRole.descriptionList.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </>
              )}
              arrow
              placement="top"
            >
              <IconButton edge="end" size="small" sx={{ color: 'text.secondary', marginRight: '14px' }}>
                <AnnouncementIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    >
      {roles.length === 0
        ? (
            <MenuItem disabled>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              {' '}
              Загрузка...
            </MenuItem>
          )
        : roles.map(role => <MenuItem key={role.id} value={role.name}>{role.description}</MenuItem>)}
    </TextField>
  )
}

export default FieldRole
