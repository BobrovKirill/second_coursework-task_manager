import type { ApiErrorResponse } from '../../hooks/useApi'
import {
  PASSWORD_RESET_REQUEST_ENDPOINT,
  SIGN_RECOVERY_ERROR_MESSAGE,
  SIGN_RECOVERY_SUCCESS_INFO,
  SIGN_RECOVERY_TEXT,
  type SignRecoveryProps,
  validateRecoveryEmail,
} from './index'
import { ArrowBack } from '@mui/icons-material'
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import useApi from '../../hooks/useApi'
import base from '../../styles/formBase.module.css'
import { useAlertModal } from '../AlertModal'
import Sign from '../Sign'
import styles from './style.module.css'

function SignRecovery({ onNavigate, onInfo }: SignRecoveryProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const api = useApi()
  const { showAlertModal } = useAlertModal()

  const validate = () => {
    const message = validateRecoveryEmail(email)
    setError(message)
    return !message
  }

  const handleSubmit = async () => {
    if (!validate())
      return
    setLoading(true)
    try {
      await api.post(PASSWORD_RESET_REQUEST_ENDPOINT, { email })
      onInfo(SIGN_RECOVERY_SUCCESS_INFO)
    }
    catch (requestError: ApiErrorResponse | unknown) {
      const message = (requestError as ApiErrorResponse)?.message || SIGN_RECOVERY_ERROR_MESSAGE
      showAlertModal({ title: 'Ошибка', message })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Sign>
      <button className={styles.backButton} onClick={() => onNavigate('signIn')}>
        <ArrowBack fontSize="small" />
        <span>Назад</span>
      </button>

      <Typography variant="h5" className={base.title}>{SIGN_RECOVERY_TEXT.title}</Typography>
      <Typography className={base.subtitle}>{SIGN_RECOVERY_TEXT.subtitle}</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={!!error}
          helperText={error}
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
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : SIGN_RECOVERY_TEXT.submitLabel}
        </Button>
      </Box>
    </Sign>
  )
}

export default SignRecovery
