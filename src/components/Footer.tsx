import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/about', label: 'About' },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <p className="footer__copy">
        © {year} <span className="footer__brand">To-Do</span>
      </p>
      <nav className="footer__nav" aria-label="Footer">
        {LINKS.map(({ to, label }) => (
          <Link key={to} className="footer__link" to={to}>
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
