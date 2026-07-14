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
  it('shows the full-bleed Kanban board on /tasks', () => {
    renderTasks()

    expect(screen.getByRole('heading', { name: /kanban board/i })).toBeInTheDocument()
    expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^doing$/i })).toBeInTheDocument()
    expect(document.querySelector('.tasks__sticky')).toBeTruthy()
  })

  it('renders tag filters on the tasks route without the footer', () => {
    renderTasks()

    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^discovery$/i })).toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})
