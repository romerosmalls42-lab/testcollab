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
  it('shows the "It worked!" success message on /tasks', () => {
    renderTasks()

    expect(screen.getByText('It worked!')).toBeInTheDocument()
  })

  it('renders the success message with the success styling class', () => {
    renderTasks()

    expect(screen.getByText('It worked!')).toHaveClass('app__success')
  })

  it('renders the Navbar and Footer on the tasks route', () => {
    renderTasks()

    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
