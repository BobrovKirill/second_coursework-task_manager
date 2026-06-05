import type { SignInfoState } from '../Sign'

export { default } from './SignInfo'

export const DEFAULT_SIGN_INFO_ACTION_LABEL = 'Войти'

export interface SignInfoProps {
  info: SignInfoState
  onAction: () => void
}
