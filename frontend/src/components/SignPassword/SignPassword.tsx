import type { ChangeEvent } from 'react'
import type { ApiErrorResponse } from '../../hooks/useApi'
import {
  DEFAULT_PASSWORD_FORM,
  type PasswordForm,
  type SignPasswordProps,
  validatePasswordForm,
} from './index'
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import useApi from '../../hooks/useApi'
import base from '../../styles/formBase.module.css'
import { useAlertModal } from '../AlertModal'
import Sign from '../Sign'
import styles from './style.module.css'

function SignPassword({
  token,
  config,
  onSuccess,
  onBack,
}: SignPasswordProps) {
  const [form, setForm] = useState<PasswordForm>(DEFAULT_PASSWORD_FORM)
  const [errors, setErrors] = useState<Partial<PasswordForm>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const api = useApi()
  const { showAlertModal } = useAlertModal()

  const set = (field: keyof PasswordForm) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async () => {
    const fields = validatePasswordForm(form)
    setErrors(fields)

    if (Object.keys(fields).length > 0) {
      return
    }

    setLoading(true)
    try {
      await api.post(config.endpoint, {
        token,
        password: form.password,
        confirm: form.confirm,
      })
      showAlertModal({ title: 'Готово', message: config.successMessage, type: 'success' })
      window.setTimeout(onSuccess, 800)
    }
    catch (error: ApiErrorResponse | unknown) {
      const message = (error as ApiErrorResponse)?.message || 'Что-то пошло не так...'
      showAlertModal({ title: 'Ошибка', message })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Sign>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowBack fontSize="small" />
        <span>Назад</span>
      </button>

      <Typography variant="h5" className={base.title}>
        {config.title}
      </Typography>
      <Typography className={base.subtitle}>
        {config.subtitle}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Новый пароль"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={set('password')}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          className={base.field}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Повторите пароль"
          type={showPassword ? 'text' : 'password'}
          value={form.confirm}
          onChange={set('confirm')}
          error={!!errors.confirm}
          helperText={errors.confirm}
          fullWidth
          className={base.field}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          className={base.submitButton}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : config.submitLabel}
        </Button>
      </Box>
    </Sign>
  )
}

export default SignPassword
