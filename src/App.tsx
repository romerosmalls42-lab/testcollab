import { useState } from 'react'
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useOutletContext,
} from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { AboutPage } from './pages/AboutPage'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage, TeamPage } from './pages/SimplePage'
import { TasksPage } from './pages/TasksPage'
import type { TagFilter } from './types/todo'
import './components/Navbar.css'
import './components/Footer.css'
import './pages/SimplePage.css'
import './App.css'

type AppShellContext = {
  tagFilter: TagFilter
}

function TasksRoute() {
  const { tagFilter } = useOutletContext<AppShellContext>()
  return <TasksPage tagFilter={tagFilter} />
}

function AppShell() {
  const [tagFilter, setTagFilter] = useState<TagFilter>('all')
  const location = useLocation()
  const isTasks = location.pathname === '/tasks'

  return (
    <div className="app">
      {isTasks ? (
        <Navbar activeFilter={tagFilter} onFilterChange={setTagFilter} />
      ) : (
        <nav className="navbar" aria-label="Main">
          <Link className="navbar__brand" to="/">
            To-Do
          </Link>
        </nav>
      )}
      <main className={isTasks ? 'app__main app__main--board' : 'app__main'}>
        <Outlet context={{ tagFilter } satisfies AppShellContext} />
      </main>
      {!isTasks && <Footer />}
    </div>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route index element={<LandingPage />} />
        <Route element={<AppShell />}>
          <Route path="tasks" element={<TasksRoute />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
