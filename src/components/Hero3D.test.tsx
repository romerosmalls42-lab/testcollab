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

  it('renders exactly three orbiting To-Do cards', () => {
    render(<Hero3D reducedMotion />)

    expect(screen.getAllByTestId('todo-orbit-card')).toHaveLength(3)
  })

  it('shows distinct To-Do card titles with task content', () => {
    render(<Hero3D reducedMotion />)

    const stage = screen.getByTestId('hero-3d-stage')
    expect(within(stage).getByText(/^today$/i)).toBeInTheDocument()
    expect(within(stage).getByText(/^focus$/i)).toBeInTheDocument()
    expect(within(stage).getByText(/^done$/i)).toBeInTheDocument()
    expect(within(stage).getByText(/draft the brief for luna/i)).toBeInTheDocument()
    expect(within(stage).getByText(/ship the landing polish/i)).toBeInTheDocument()
    expect(within(stage).getByText(/reply to harper/i)).toBeInTheDocument()
  })

  it('marks finished work complete on the Done card', () => {
    render(<Hero3D reducedMotion />)

    const stage = screen.getByTestId('hero-3d-stage')
    expect(within(stage).getByText(/draft the brief for luna/i).closest('li')).toHaveClass(
      'hero3d__task--done',
    )
    expect(within(stage).getByText(/ship the landing polish/i).closest('li')).not.toHaveClass(
      'hero3d__task--done',
    )
  })

  it('exposes a parallax orbit ring for scroll-driven motion', () => {
    render(<Hero3D reducedMotion />)

    expect(screen.getByTestId('todo-orbit-ring')).toBeInTheDocument()
    expect(screen.getByTestId('parallax-depth-far')).toBeInTheDocument()
    expect(screen.getByTestId('parallax-depth-mid')).toBeInTheDocument()
  })
})
