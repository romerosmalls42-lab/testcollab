import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('Landing routing', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts on the cinematic landing page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /let to-do manage your daily tasks so you don't have to/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start your list/i })).toBeInTheDocument()
  })

  it('takes Start your list into the To-Do app', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /start your list/i }))

    expect(screen.getByRole('heading', { name: /kanban board/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
  })

  it('scrolls to the top when opening the To-Do board from the landing page', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /start your list/i }))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })
})
