import type { AlertModalProviderProps, AlertOptions } from './index.ts'
import { Alert, AlertTitle, Snackbar } from '@mui/material'
import { useCallback, useState } from 'react'
import {
  AlertModalContext,

  DEFAULT_DURATION,
} from './index.ts'

function AlertModal({ children }: AlertModalProviderProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<AlertOptions>({ message: '' })

  const showAlertModal = useCallback((input: AlertOptions | string) => {
    const normalized: AlertOptions = typeof input === 'string'
      ? { message: input, type: 'error' }
      : input

    setOptions({ type: 'error', duration: DEFAULT_DURATION, ...normalized })
    setOpen(true)
  }, [])

  function handleClose(_: unknown, reason?: string) {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  return (
    <AlertModalContext value={{ showAlertModal }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={options.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={options.type || 'error'}
          onClose={() => setOpen(false)}
          variant="filled"
          sx={{ minWidth: 320 }}
        >
          {options.title && <AlertTitle>{options.title}</AlertTitle>}
          {options.message}
        </Alert>
      </Snackbar>
    </AlertModalContext>
  )
}

export default AlertModal
