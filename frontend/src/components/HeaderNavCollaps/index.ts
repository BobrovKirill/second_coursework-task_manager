import type {NavItem} from "../HeaderNav";

export interface ListItem {
  id: number | string
  name: string
}

export interface CollapsibleSectionProps {
  item: Extract<NavItem, { slug: string }>
  onNavigate: (path: string) => void
}