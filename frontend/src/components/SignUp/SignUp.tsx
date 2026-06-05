import type { SingFormTypes } from '../Sign'
import type { SignUpProps } from './index'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import useApi, { type ApiErrorResponse } from '../../hooks/useApi.ts'
import base from '../../styles/formBase.module.css'
import { useAlertModal } from '../AlertModal'
import Sign, { validateSignUpForm } from '../Sign'
import {
  SIGN_UP_ENDPOINT,
  SIGN_UP_ERROR_MESSAGE,
  SIGN_UP_INITIAL_FORM,
  SIGN_UP_SUCCESS_INFO,
  SIGN_UP_TEXT,
} from './index'

function SignUp({ onNavigate, onInfo }: SignUpProps) {
  const [form, setForm] = useState<SingFormTypes>(SIGN_UP_INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const { showAlertModal } = useAlertModal()
  const api = useApi()

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    const fields = validateSignUpForm(form)
    setErrors(fields)
    const isValidate = !Object.keys(fields).length

    if (!isValidate) {
      return
    }

    setLoading(true)
    try {
      await api.post(SIGN_UP_ENDPOINT, form)
      onInfo(SIGN_UP_SUCCESS_INFO)
    }
    catch (error: ApiErrorResponse | unknown) {
      const message = (error as ApiErrorResponse)?.message || SIGN_UP_ERROR_MESSAGE
      showAlertModal({ title: 'Ошибка', message })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Sign>
      <Typography variant="h5" className={base.title}>{SIGN_UP_TEXT.title}</Typography>
      <Typography className={base.subtitle}>{SIGN_UP_TEXT.subtitle}</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Имя"
          value={form.username}
          onChange={set('username')}
          error={!!errors.username}
          helperText={errors.username}
          fullWidth
          className={base.field}
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          className={base.field}
        />
        <TextField
          label="Пароль"
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
                <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
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
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : SIGN_UP_TEXT.submitLabel}
        </Button>
      </Box>

      <p className={base.footer}>
        {SIGN_UP_TEXT.footerText}
        {' '}
        <span className={base.link} onClick={() => onNavigate('signIn')}>
          {SIGN_UP_TEXT.signInLabel}
        </span>
      </p>
    </Sign>
  )
}

export default SignUp
