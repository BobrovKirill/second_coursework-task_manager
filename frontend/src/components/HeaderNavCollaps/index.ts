import type {NavItem} from "../HeaderNav";
import type {UserListItem} from "../../types/user";

export interface ListItem {
  id: number | string
  name?: string
  username?: string
  email?: string
}

export interface CollapsibleSectionProps {
  item: Extract<NavItem, { slug: string }>
  onNavigate: (path: string) => void
  onCreateProject?: () => void
}