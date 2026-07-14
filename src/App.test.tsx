import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderTasks() {
  return render(
    <MemoryRouter initialEntries={['/tasks']}>
      <App />
    </MemoryRouter>,
  )
}

describe('Tasks app shell', () => {
  it('shows the product Kanban board on /tasks', () => {
    renderTasks()

    expect(screen.getByRole('heading', { name: /product board/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^backlog$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^in progress$/i })).toBeInTheDocument()
  })

  it('renders tag filters and Footer on the tasks route', () => {
    renderTasks()

    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^discovery$/i })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
