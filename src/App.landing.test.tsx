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
        name: /assign it\. your agents handle it\.?/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /deploy your first agent/i }),
    ).toBeInTheDocument()
  })

  it('takes Deploy Your First Agent into the To-Do app', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /deploy your first agent/i }))

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

    await user.click(screen.getByRole('link', { name: /deploy your first agent/i }))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('opens Add Agents and Dashboard from the landing navbar', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: /^add agents$/i }))
    expect(screen.getByRole('heading', { name: /^add agents$/i })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /^to-do$/i }))
    await user.click(screen.getByRole('link', { name: /^dashboard$/i }))
    expect(screen.getByRole('heading', { name: /^dashboard$/i })).toBeInTheDocument()
  })
})
