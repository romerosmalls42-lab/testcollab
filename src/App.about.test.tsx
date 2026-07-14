import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('About page routing', () => {
  it('navigates to the About page from the footer link', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /^about$/i }))

    expect(screen.getByRole('heading', { level: 1, name: /^about$/i })).toBeInTheDocument()
    expect(
      screen.getByText(/capture tasks, stay organized, and mark work done/i),
    ).toBeInTheDocument()
  })

  it('returns to tasks from the About page back-to-tasks link', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /back to tasks/i }))

    expect(screen.getByText(/it worked!/i)).toBeInTheDocument()
  })
})
