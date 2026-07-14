import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AboutPage } from './AboutPage'

function renderAbout() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  )
}

describe('AboutPage', () => {
  it('renders an About heading', () => {
    renderAbout()

    expect(screen.getByRole('heading', { level: 1, name: /^about$/i })).toBeInTheDocument()
  })

  it('explains what the To-Do app is for', () => {
    renderAbout()

    expect(
      screen.getByText(/capture tasks, stay organized, and mark work done/i),
    ).toBeInTheDocument()
  })

  it('lists key product features', () => {
    renderAbout()

    expect(screen.getByRole('heading', { name: /what you can do/i })).toBeInTheDocument()
    expect(screen.getByText(/filter tasks by all, active, or completed/i)).toBeInTheDocument()
    expect(screen.getByText(/keep your list focused on what matters next/i)).toBeInTheDocument()
    expect(screen.getByText(/track progress as you finish items/i)).toBeInTheDocument()
  })

  it('provides a link back to the task list', () => {
    renderAbout()

    expect(screen.getByRole('link', { name: /back to tasks/i })).toHaveAttribute('href', '/tasks')
  })
})
