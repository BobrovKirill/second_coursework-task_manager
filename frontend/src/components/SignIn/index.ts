import type { AuthView } from '../Sign'

export interface SignInProps {
  onNavigate: (view: AuthView) => void
}

export { default } from './SignIn.tsx'
