import type { SignInfoProps } from './index'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Button, Stack, Typography } from '@mui/material'
import base from '../../styles/formBase.module.css'
import Sign from '../Sign'
import { DEFAULT_SIGN_INFO_ACTION_LABEL } from './index'

function SignInfo({
  info,
  onAction,
}: SignInfoProps) {
  const actionLabel = info.actionLabel ?? DEFAULT_SIGN_INFO_ACTION_LABEL

  return (
    <Sign>
      <Stack spacing={2.5} alignItems="center" textAlign="center">
        <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#1e3a8a' }} />

        <div>
          <Typography variant="h5" className={base.title}>
            {info.title}
          </Typography>
          <Typography className={base.subtitle} sx={{ mb: 0 }}>
            {info.message}
          </Typography>
        </div>

        <Button
          fullWidth
          variant="contained"
          className={base.submitButton}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </Stack>
    </Sign>
  )
}

export default SignInfo
