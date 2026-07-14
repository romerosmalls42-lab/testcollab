import { Link } from 'react-router-dom'
import { TODO_TAGS, type TagFilter } from '../types/todo'

export type NavbarProps = {
  activeFilter: TagFilter
  onFilterChange: (filter: TagFilter) => void
}

const FILTERS: { id: TagFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...TODO_TAGS.map((tag) => ({ id: tag, label: tag })),
]

export function Navbar({ activeFilter, onFilterChange }: NavbarProps) {
  return (
    <nav className="navbar" aria-label="Main">
      <Link className="navbar__brand" to="/">
        To-Do
      </Link>
      <div className="navbar__filters" role="group" aria-label="Filter board by work type">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={
              activeFilter === id
                ? 'navbar__filter navbar__filter--active'
                : 'navbar__filter'
            }
            aria-pressed={activeFilter === id}
            onClick={() => onFilterChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
