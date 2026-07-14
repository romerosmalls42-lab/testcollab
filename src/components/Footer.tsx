const LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/about', label: 'About' },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <p className="footer__copy">
        © {year} <span className="footer__brand">To-Do</span>
      </p>
      <nav className="footer__nav" aria-label="Footer">
        {LINKS.map(({ href, label }) => (
          <a key={href} className="footer__link" href={href}>
            {label}
          </a>
        ))}
      </nav>
    </footer>
  )
}
