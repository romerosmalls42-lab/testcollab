import { useState } from 'react'
import { Navbar, type TodoFilter } from './components/Navbar'
import './components/Navbar.css'
import './App.css'

function App() {
  const [filter, setFilter] = useState<TodoFilter>('all')

  return (
    <div className="app">
      <Navbar activeFilter={filter} onFilterChange={setFilter} />
      <main className="app__main">
        <h1 className="app__title">Your tasks</h1>
        <p className="app__subtitle">
          Showing <span className="app__filter-label">{filter}</span> tasks.
        </p>
      </main>
    </div>
  )
}

export default App
