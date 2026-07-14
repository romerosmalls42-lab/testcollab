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

  it('renders four kanban To-Do cards in orbit', () => {
    render(<Hero3D reducedMotion />)

    expect(screen.getAllByTestId('todo-orbit-card')).toHaveLength(4)
  })

  it('labels cards Backlog, Doing, Review, and Done', () => {
    render(<Hero3D reducedMotion />)

    const stage = screen.getByTestId('hero-3d-stage')
    expect(within(stage).getByText(/^backlog$/i)).toBeInTheDocument()
    expect(within(stage).getByText(/^doing$/i)).toBeInTheDocument()
    expect(within(stage).getByText(/^review$/i)).toBeInTheDocument()
    expect(within(stage).getByText(/^done$/i)).toBeInTheDocument()
  })

  it('shows an agent-execution benefit on each card', () => {
    render(<Hero3D reducedMotion />)

    expect(screen.getByTestId('todo-benefit-backlog')).toHaveTextContent(
      /work queued for agents/i,
    )
    expect(screen.getByTestId('todo-benefit-doing')).toHaveTextContent(
      /agents actively executing/i,
    )
    expect(screen.getByTestId('todo-benefit-review')).toHaveTextContent(
      /agent output awaiting human approval/i,
    )
    expect(screen.getByTestId('todo-benefit-done')).toHaveTextContent(
      /shipped by your agents/i,
    )
  })

  it('pops a card out of orbit when it becomes active', () => {
    render(<Hero3D reducedMotion activeCard={1} />)

    const stage = screen.getByTestId('hero-3d-stage')
    expect(stage).toHaveAttribute('data-active-card', 'doing')
    expect(screen.getByTestId('todo-featured-card')).toHaveAttribute('data-column', 'doing')
    expect(screen.getByTestId('todo-featured-card')).toHaveTextContent(
      /agents actively executing/i,
    )
  })

  it('marks the featured card with a pop-in appearance animation', () => {
    render(<Hero3D activeCard={0} />)

    expect(screen.getByTestId('todo-featured-card')).toHaveAttribute(
      'data-animate',
      'pop-in',
    )
  })

  it('exposes a parallax orbit ring for scroll-driven motion', () => {
    render(<Hero3D reducedMotion />)

    expect(screen.getByTestId('todo-orbit-ring')).toBeInTheDocument()
    expect(screen.getByTestId('parallax-depth-far')).toBeInTheDocument()
    expect(screen.getByTestId('parallax-depth-mid')).toBeInTheDocument()
  })
})
