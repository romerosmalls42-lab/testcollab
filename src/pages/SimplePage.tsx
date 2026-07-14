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
      title="Add Team Members"
      lead="Invite collaborators so your product team can plan, build, and ship in one place."
    />
  )
}

export function DashboardPage() {
  return (
    <SimplePage
      title="Dashboard"
      lead="See delivery health across Backlog, Doing, Review, and Done at a glance."
    />
  )
}
