import { Link } from 'react-router-dom'
import './AboutPage.css'

const FEATURES = [
  'Filter tasks by All, Active, or Completed',
  'Keep your list focused on what matters next',
  'Track progress as you finish items',
] as const

export function AboutPage() {
  return (
    <section className="about" aria-labelledby="about-heading">
      <h1 id="about-heading" className="about__title">
        About
      </h1>
      <p className="about__lead">
        To-Do helps you capture tasks, stay organized, and mark work done without the clutter.
      </p>

      <h2 className="about__subtitle">What you can do</h2>
      <ul className="about__features">
        {FEATURES.map((feature) => (
          <li key={feature} className="about__feature">
            {feature}
          </li>
        ))}
      </ul>

      <Link className="about__cta" to="/">
        Back to tasks
      </Link>
    </section>
  )
}
