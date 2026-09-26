const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const icon = (children, extra = {}) => (p) => <svg {...base} {...extra} {...p}>{children}</svg>

export const SearchIcon = icon(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const CartIcon = icon(
  <>
    <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
    <path d="M2.5 3h2.2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h9a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
  </>,
)
export const PinIcon = icon(<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>)
export const ChevronDownIcon = icon(<path d="m6 9 6 6 6-6" />)
export const ChevronRightIcon = icon(<path d="m9 6 6 6-6 6" />)
export const XIcon = icon(<path d="M18 6 6 18M6 6l12 12" />)
export const FilterIcon = icon(<path d="M4 6h16M7 12h10M10 18h4" />)
export const MinusIcon = icon(<path d="M5 12h14" />)
export const PlusIcon = icon(<path d="M12 5v14M5 12h14" />)
export const CheckIcon = icon(<path d="m5 12 5 5L20 7" />)
export const StoreIcon = icon(<><path d="M3 9.5 4.5 4h15L21 9.5" /><path d="M4 10v10h16V10" /><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M10 20v-5h4v5" /></>)
export const ShieldIcon = icon(<><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>)
export const TagIcon = icon(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>)

export const WhatsAppIcon = (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
  </svg>
)

// Íconos de categoría (nombre = categories.json → icon)
const categoryIcons = {
  generador: icon(<><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M7 7V5h10v2" /><path d="m13 9.5-3 4h4l-3 4" /><path d="M5 19v2M19 19v2" /></>),
  hidrolavadora: icon(<><path d="M4 10h9l2-3h3v6h-3l-2-2H9v3H6v-3" /><path d="M6 14v6" /><path d="M20 8.5c1 .5 1.5 1.3 1.5 2M20 11.5c.8.5 1.2 1.1 1.2 1.8" /></>),
  compresor: icon(<><rect x="3" y="10" width="14" height="8" rx="4" /><circle cx="17.5" cy="6.5" r="2.5" /><path d="M17.5 9v1M6 18v2M14 18v2M17.5 5.5v1l.8.5" /></>),
  podadora: icon(<><path d="M3 5l6 8" /><path d="M7 13h12l1 4H6l1-4Z" /><circle cx="8" cy="19" r="1.8" /><circle cx="18" cy="19" r="1.8" /></>),
  carpinteria: icon(<><path d="M3 17 15 5l4 4L7 21H3v-4Z" /><path d="M6 14l1 1M9 11l1 1M12 8l1 1" /></>),
  construccion: icon(<><path d="M4 16a8 8 0 0 1 16 0" /><path d="M2 16h20v3H2z" /><path d="M10 8V5h4v3" /></>),
  automotriz: icon(<><path d="M5 16V11l2-5h10l2 5v5" /><path d="M3 16h18v2H3z" /><circle cx="7.5" cy="13" r="1" /><circle cx="16.5" cy="13" r="1" /></>),
}

export function CategoryIcon({ name, ...p }) {
  const Icon = categoryIcons[name] ?? TagIcon
  return <Icon {...p} />
}
