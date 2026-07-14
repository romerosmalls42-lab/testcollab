import { describe, it, expect } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TasksPage } from './TasksPage'

function renderTasks(
  tagFilter: 'all' | 'Discovery' | 'Design' | 'Engineering' | 'Growth' | 'Bug' = 'all',
) {
  return render(
    <MemoryRouter>
      <TasksPage tagFilter={tagFilter} />
    </MemoryRouter>,
  )
}

function createDataTransfer() {
  const store: Record<string, string> = {}
  return {
    effectAllowed: 'move',
    dropEffect: 'move',
    setData(type: string, value: string) {
      store[type] = value
    },
    getData(type: string) {
      return store[type] ?? ''
    },
  }
}

describe('TasksPage Kanban', () => {
  it('shows Mission Control with agent-state columns', () => {
    renderTasks()

    expect(screen.getByRole('heading', { name: /mission control/i })).toBeInTheDocument()
    expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^queued$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^agents working$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^needs your review$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^shipped by agents$/i })).toBeInTheDocument()

    const card = screen
      .getByText(/validate pricing hypothesis/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(card).toHaveClass('tasks__sticky')
    expect(card).toHaveClass('tasks__sticky--queued')
  })

  it('shows agent presence and live working agent count', () => {
    renderTasks()

    const workingCard = screen
      .getByText(/redesign empty states/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(within(workingCard).getByText(/^nova$/i)).toBeInTheDocument()
    expect(workingCard).toHaveClass('tasks__sticky--working')

    const reviewCard = screen
      .getByText(/ship auth polish/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(within(reviewCard).getByText(/awaiting your approval/i)).toBeInTheDocument()

    expect(screen.getByTestId('active-agent-count')).toHaveTextContent(/2 agents live/i)
  })

  it('renders tags on work items', () => {
    renderTasks()

    const card = screen
      .getByText(/validate pricing hypothesis/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(within(card).getByText(/^discovery$/i)).toBeInTheDocument()
  })

  it('explains tagging as choosing a work type', () => {
    renderTasks()

    expect(
      screen.getByRole('group', { name: /what type of work is this/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/tag the brief so you can filter the board later/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tag as discovery/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /tag as discovery/i })).toHaveClass(
      'tasks__tag-option--selected',
    )
    expect(screen.getByText(/research & validation/i)).toBeInTheDocument()
  })

  it('lets you assign or auto-assign an agent when briefing', async () => {
    const user = userEvent.setup()
    renderTasks()

    expect(screen.getByRole('button', { name: /^auto-assign$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: /assign to forge/i }))
    expect(screen.getByRole('button', { name: /assign to forge/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('highlights the chosen tag in gold when selected', async () => {
    const user = userEvent.setup()
    renderTasks()

    const growth = screen.getByRole('button', { name: /tag as growth/i })
    await user.click(growth)

    expect(growth).toHaveAttribute('aria-pressed', 'true')
    expect(growth).toHaveClass('tasks__tag-option--selected')
    expect(screen.getByRole('button', { name: /tag as discovery/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('dispatches a brief into Queued', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.type(
      screen.getByLabelText(/what should an agent do/i),
      'Map checkout funnel',
    )
    await user.click(screen.getByRole('button', { name: /tag as growth/i }))
    await user.click(screen.getByRole('button', { name: /assign to scout/i }))
    await user.click(screen.getByRole('button', { name: /dispatch to agent/i }))

    const queued = screen.getByRole('region', { name: /^queued$/i })
    const card = within(queued)
      .getByText(/map checkout funnel/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(card).toHaveClass('tasks__sticky')
    expect(within(card).getByText(/^growth$/i)).toBeInTheDocument()
    expect(within(card).getByText(/^scout$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/what should an agent do/i)).toHaveValue('')
  })

  it('drags a sticky note from Queued into Agents Working with a move animation', () => {
    renderTasks()

    const card = screen.getByText(/validate pricing hypothesis/i).closest('[data-todo-id]')!
    const working = screen.getByRole('region', { name: /^agents working$/i })
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.dragOver(working, { dataTransfer })
    fireEvent.drop(working, { dataTransfer })

    const moved = within(working)
      .getByText(/validate pricing hypothesis/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(moved).toHaveClass('tasks__sticky--arriving')
    expect(moved).toHaveClass('tasks__sticky--working')
    expect(
      within(screen.getByRole('region', { name: /^queued$/i })).queryByText(
        /validate pricing hypothesis/i,
      ),
    ).not.toBeInTheDocument()
  })

  it('celebrates when a sticky note moves into Shipped by Agents', () => {
    renderTasks()

    const card = screen.getByText(/ship auth polish/i).closest('[data-todo-id]')!
    const done = screen.getByRole('region', { name: /^shipped by agents$/i })
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.dragOver(done, { dataTransfer })
    fireEvent.drop(done, { dataTransfer })

    expect(screen.getByTestId('done-party')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/shipped/i)
  })

  it('filters the board by tag', () => {
    renderTasks('Engineering')

    expect(screen.getByText(/ship auth polish/i)).toBeInTheDocument()
    expect(screen.queryByText(/validate pricing hypothesis/i)).not.toBeInTheDocument()
  })

  it('removes a work item', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.click(
      screen.getByRole('button', { name: /delete validate pricing hypothesis/i }),
    )

    expect(screen.queryByText(/validate pricing hypothesis/i)).not.toBeInTheDocument()
  })
})
