import type { AuthView } from '../Sign'
import { ArrowBack } from '@mui/icons-material'
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import base from '../../styles/formBase.module.css'
import Sign from '../Sign'
import styles from './style.module.css'

interface SignRecoveryProps {
  onNavigate: (view: AuthView) => void
}

function SignRecovery({ onNavigate }: SignRecoveryProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!email) { setError('Введите email'); return false }
    if (!/\S[^\s@]*@\S+\.\S+/.test(email)) { setError('Некорректный email'); return false }
    setError('')
    return true
  }

  const handleSubmit = async () => {
    if (!validate())
      return
    setLoading(true)
    try {
      // TODO: вызов store/api
      await new Promise(r => setTimeout(r, 1000))
      setSent(true)
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

      <Typography variant="h5" className={base.title}>Восстановление пароля</Typography>
      <Typography className={base.subtitle}>Отправим ссылку для сброса на ваш email</Typography>

      {sent
        ? (
            <Alert severity="success" className={styles.successAlert}>
              Письмо отправлено. Проверьте почту.
            </Alert>
          )
        : (
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
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Отправить ссылку'}
              </Button>
            </Box>
          )}
    </Sign>
  )
}

export default SignRecovery
