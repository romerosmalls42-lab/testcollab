import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Hero3D } from './Hero3D'

describe('Hero3D', () => {
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

  it('shows a To-Do list card with a title and task rows', () => {
    render(<Hero3D reducedMotion />)

    const stage = screen.getByTestId('hero-3d-stage')
    expect(within(stage).getByText(/^today$/i)).toBeInTheDocument()
    expect(within(stage).getByText(/draft the brief for luna/i)).toBeInTheDocument()
    expect(within(stage).getByText(/ship the landing polish/i)).toBeInTheDocument()
    expect(within(stage).getByText(/reply to harper/i)).toBeInTheDocument()
  })

  it('marks at least one task complete and leaves others open', () => {
    render(<Hero3D reducedMotion />)

    const stage = screen.getByTestId('hero-3d-stage')
    expect(within(stage).getByText(/draft the brief for luna/i).closest('li')).toHaveClass(
      'hero3d__task--done',
    )
    expect(within(stage).getByText(/ship the landing polish/i).closest('li')).not.toHaveClass(
      'hero3d__task--done',
    )
  })
})
