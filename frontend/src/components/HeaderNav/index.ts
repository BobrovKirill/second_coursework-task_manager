import type { SvgIconComponent } from '@mui/icons-material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import GroupIcon from '@mui/icons-material/Group'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import { ROUTES } from '../../constants/routes.ts'

export const DRAWER_WIDTH = 280

export interface NavItem {
  label: string
  icon: SvgIconComponent
  path?: string
  slug?: string
  button?: {
    label: string
    path?: string
  }
  isMembers?: boolean
  isBoard?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Главная',
    path: ROUTES.MAIN,
    icon: DashboardIcon,
  },
  {
    label: 'Проекты',
    slug: '/projects',
    button: {
      label: 'Добавить проект',
      path: ROUTES.PROJECT_CREATE,
    },
    icon: FolderIcon,
  },
  {
    label: 'Доска',
    icon: ViewKanbanIcon,
    isBoard: true,
  },
  {
    label: 'Участники',
    button: {
      label: 'Добавить участника',
    },
    icon: GroupIcon,
    isMembers: true,
  },
]

export interface NavDrawerProps {
  open: boolean
  onClose: () => void
}

export { default } from './HeaderNav.tsx'
