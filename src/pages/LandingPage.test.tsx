import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from './LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
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

  it('presents To-Do as the hero brand', () => {
    renderLanding()

    expect(screen.getByRole('banner')).toHaveTextContent(/^to-?do$/i)
  })

  it('leads with the manage-your-tasks message', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /let to-do manage your daily tasks so you don't have to/i,
      }),
    ).toBeInTheDocument()
  })

  it('markets To-Do as a one-stop shop for product teams', () => {
    renderLanding()

    expect(
      screen.getByText(/one-stop shop for product teams building amazing products/i),
    ).toBeInTheDocument()
  })

  it('has a clear CTA that starts the To-Do app', () => {
    renderLanding()

    expect(screen.getByRole('link', { name: /start your list/i })).toHaveAttribute(
      'href',
      '/tasks',
    )
  })

  it('renders a parallax stage with four orbiting board cards', () => {
    renderLanding()

    expect(screen.getByTestId('parallax-landing')).toBeInTheDocument()
    expect(screen.getByTestId('hero-3d-stage')).toBeInTheDocument()
    expect(screen.getAllByTestId('todo-orbit-card')).toHaveLength(4)
  })

  it('includes scroll beats so cards can pop out one by one', () => {
    renderLanding()

    expect(screen.getByTestId('landing-scroll-track')).toBeInTheDocument()
    expect(screen.getAllByTestId('landing-scroll-beat')).toHaveLength(4)
  })
})
