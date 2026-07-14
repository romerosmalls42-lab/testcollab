import { Link } from 'react-router-dom'
import './SimplePage.css'

type SimplePageProps = {
  title: string
  lead: string
}

export function SimplePage({ title, lead }: SimplePageProps) {
  return (
    <section className="simple-page" aria-labelledby="simple-page-heading">
      <h1 id="simple-page-heading" className="simple-page__title">
        {title}
      </h1>
      <p className="simple-page__lead">{lead}</p>
      <Link className="simple-page__cta" to="/tasks">
        Open To-Do
      </Link>
    </section>
  )
}

export function TeamPage() {
  return (
    <SimplePage
      title="Add Agents"
      lead="Deploy AI agents to your board so they can claim work, execute autonomously, and report back for review."
    />
  )
}

export function DashboardPage() {
  return (
    <SimplePage
      title="Dashboard"
      lead="See delivery health across Queued, Agents Working, Review, and Shipped at a glance."
    />
  )
}
