import { useState } from 'react'
import { Navbar, type TodoFilter } from './components/Navbar'
import { Footer } from './components/Footer'
import './components/Navbar.css'
import './components/Footer.css'
import './App.css'

function App() {
  const [filter, setFilter] = useState<TodoFilter>('all')

  return (
    <div className="app">
      <Navbar activeFilter={filter} onFilterChange={setFilter} />
      <main className="app__main">
        <p className="app__success">It worked!</p>
      </main>
      <Footer />
    </div>
  )
}

export default App
