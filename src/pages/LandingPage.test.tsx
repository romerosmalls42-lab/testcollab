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

  it('leads with an agentic assign-and-execute message', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /assign it\. your agents handle it\.?/i,
      }),
    ).toBeInTheDocument()
  })

  it('markets To-Do as agents moving work across the board', () => {
    renderLanding()

    expect(
      screen.getByText(/work advances across the board as agents claim, execute, and return results/i),
    ).toBeInTheDocument()
  })

  it('has a clear CTA to deploy an agent', () => {
    renderLanding()

    expect(
      screen.getByRole('link', { name: /deploy your first agent/i }),
    ).toHaveAttribute('href', '/tasks')
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

  it('uses a compact scroll track so card reveals arrive quickly', () => {
    renderLanding()

    expect(screen.getByTestId('landing-scroll-track')).toHaveAttribute(
      'data-scroll-pace',
      'snappy',
    )
  })

  it('hints that scrolling reveals the board story', () => {
    renderLanding()

    expect(screen.getByText(/scroll to explore the board/i)).toBeInTheDocument()
  })

  it('shows a bouncing scroll arrow near the cards', () => {
    renderLanding()

    const arrow = screen.getByTestId('landing-scroll-arrow')
    expect(arrow).toBeInTheDocument()
    expect(arrow).toHaveTextContent(/scroll/i)
  })

  it('shows a landing navbar with To-Do, Add Agents, and Dashboard', () => {
    renderLanding()

    const nav = screen.getByRole('navigation', { name: /landing/i })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^add agents$/i })).toHaveAttribute(
      'href',
      '/team',
    )
    expect(screen.getByRole('link', { name: /^dashboard$/i })).toHaveAttribute(
      'href',
      '/dashboard',
    )
  })

  it('includes the site footer on the landing page', () => {
    renderLanding()

    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent(/to-?do/i)
    expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: /^privacy$/i })).toHaveAttribute(
      'href',
      '/privacy',
    )
  })
})
