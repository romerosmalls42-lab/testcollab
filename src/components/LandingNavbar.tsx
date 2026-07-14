import { Link } from 'react-router-dom'
import './LandingNavbar.css'

export function LandingNavbar() {
  return (
    <nav className="landing-nav" aria-label="Landing">
      <Link className="landing-nav__brand" to="/" aria-label="To-Do home">
        To-Do
      </Link>
      <div className="landing-nav__links">
        <Link className="landing-nav__link" to="/tasks">
          To-Do
        </Link>
        <Link className="landing-nav__link" to="/channel">
          Channel
        </Link>
        <Link className="landing-nav__link" to="/team">
          Add Agents
        </Link>
        <Link className="landing-nav__link" to="/dashboard">
          Dashboard
        </Link>
      </div>
    </nav>
  )
}
