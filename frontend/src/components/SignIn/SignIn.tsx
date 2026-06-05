import type { SingFormTypes } from '../Sign'
import {
  SIGN_IN_ENDPOINT,
  SIGN_IN_ERROR_MESSAGE,
  SIGN_IN_INITIAL_FORM,
  SIGN_IN_SUCCESS_ALERT,
  SIGN_IN_TEXT,
  type SignInProps,
} from './index.ts'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.ts'
import useApi, { type ApiErrorResponse } from '../../hooks/useApi.ts'
import base from '../../styles/formBase.module.css'
import { setToken } from '../../utils/cookie.ts'
import { useAlertModal } from '../AlertModal'
import Sign, { validateSignUpForm } from '../Sign'
import styles from './style.module.css'

function SignIn({ onNavigate }: SignInProps) {
  const [form, setForm] = useState<SingFormTypes>(SIGN_IN_INITIAL_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string, password?: string }>({})

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const { showAlertModal } = useAlertModal()
  const api = useApi()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const fields = validateSignUpForm(form)
    setErrors(fields)
    const isValidate = !Object.keys(fields).length

    if (!isValidate) {
      return
    }

    setLoading(true)
    try {
      const { access_token = '' } = await api.post(SIGN_IN_ENDPOINT, form)
      setToken(access_token)
      showAlertModal(SIGN_IN_SUCCESS_ALERT)
      navigate(ROUTES.MAIN)
    }
    catch (error: ApiErrorResponse | unknown) {
      const message = (error as ApiErrorResponse)?.message || SIGN_IN_ERROR_MESSAGE
      showAlertModal({ title: 'Ошибка', message })
    }

    finally {
      setLoading(false)
    }
  }

  return (
    <Sign>
      <Typography variant="h5" className={base.title}>{SIGN_IN_TEXT.title}</Typography>
      <Typography className={base.subtitle}>{SIGN_IN_TEXT.subtitle}</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

        <Box className={styles.row}>
          <span className={base.link} onClick={() => onNavigate('signRecovery')}>
            {SIGN_IN_TEXT.forgotPasswordLabel}
          </span>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          className={base.submitButton}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : SIGN_IN_TEXT.submitLabel}
        </Button>
      </Box>

      <p className={base.footer}>
        {SIGN_IN_TEXT.footerText}
        {' '}
        <span className={base.link} onClick={() => onNavigate('signUp')}>
          {SIGN_IN_TEXT.signUpLabel}
        </span>
      </p>
    </Sign>
  )
}

export default SignIn
