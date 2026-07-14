import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('shows a single primary headline and supporting line', () => {
    renderLanding()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /a quieter way to move work forward/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/one list\. clear next actions\. nothing else competing/i),
    ).toBeInTheDocument()
  })

  it('has a clear CTA that starts the To-Do app', () => {
    renderLanding()

    expect(screen.getByRole('link', { name: /start your list/i })).toHaveAttribute(
      'href',
      '/tasks',
    )
  })

  it('includes progressive sections revealed below the hero', () => {
    renderLanding()

    expect(screen.getByRole('heading', { name: /^capture$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^focus$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^finish$/i })).toBeInTheDocument()
  })

  it('renders a cinematic 3D hero stage', () => {
    renderLanding()

    expect(screen.getByTestId('hero-3d-stage')).toBeInTheDocument()
    expect(screen.getByTestId('hero-3d-stage')).toHaveAttribute('aria-hidden', 'true')
  })

  it('offers a control to disclose the next landing beat', async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    renderLanding()

    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(scrollIntoView).toHaveBeenCalled()
  })
})
