import { useState } from 'react'
import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar, type TodoFilter } from './components/Navbar'
import { Footer } from './components/Footer'
import { AboutPage } from './pages/AboutPage'
import { LandingPage } from './pages/LandingPage'
import './components/Navbar.css'
import './components/Footer.css'
import './App.css'

function TasksPage() {
  return <p className="app__success">It worked!</p>
}

function AppShell() {
  const [filter, setFilter] = useState<TodoFilter>('all')
  const location = useLocation()
  const showFilters = location.pathname === '/tasks'

  return (
    <div className="app">
      {showFilters ? (
        <Navbar activeFilter={filter} onFilterChange={setFilter} />
      ) : (
        <nav className="navbar" aria-label="Main">
          <Link className="navbar__brand" to="/">
            To-Do
          </Link>
        </nav>
      )}
      <main className="app__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="tasks" element={<TasksPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  )
}

export default App
