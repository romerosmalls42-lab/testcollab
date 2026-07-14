export type TodoFilter = 'all' | 'active' | 'completed'

export type NavbarProps = {
  activeFilter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
}

const FILTERS: { id: TodoFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
]

export function Navbar({ activeFilter, onFilterChange }: NavbarProps) {
  return (
    <nav className="navbar" aria-label="Main">
      <a className="navbar__brand" href="/">
        To-Do
      </a>
      <div className="navbar__filters" role="group" aria-label="Filter tasks">
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
