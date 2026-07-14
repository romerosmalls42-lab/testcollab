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

  it('shows department presence and live working department count', () => {
    renderTasks()

    const workingCard = screen
      .getByText(/redesign empty states/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(workingCard).toHaveAttribute('data-department', 'design')
    expect(within(workingCard).getByTitle(/^design$/i)).toBeInTheDocument()
    expect(workingCard).toHaveClass('tasks__sticky--working')

    const reviewCard = screen
      .getByText(/ship auth polish/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(within(reviewCard).getByText(/awaiting your approval/i)).toBeInTheDocument()

    expect(screen.getByTestId('active-agent-count')).toHaveTextContent(/2 departments live/i)
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
      screen.getByText(/tag the brief so the matching department owns it/i),
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

  it('lets you assign or auto-assign a department when briefing', async () => {
    const user = userEvent.setup()
    renderTasks()

    expect(screen.getByRole('button', { name: /^auto-assign$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: /assign to engineering/i }))
    expect(screen.getByRole('button', { name: /assign to engineering/i })).toHaveAttribute(
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
      screen.getByLabelText(/what should a department do/i),
      'Map checkout funnel',
    )
    await user.click(screen.getByRole('button', { name: /tag as growth/i }))
    await user.click(screen.getByRole('button', { name: /assign to operations/i }))
    await user.click(screen.getByRole('button', { name: /dispatch to department/i }))

    const queued = screen.getByRole('region', { name: /^queued$/i })
    const card = within(queued)
      .getByText(/map checkout funnel/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(card).toHaveClass('tasks__sticky')
    expect(within(card).getByText(/^growth$/i)).toBeInTheDocument()
    expect(within(card).getByText(/^operations$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/what should a department do/i)).toHaveValue('')
  })

  it('opens a task-anchored department channel from a discuss control', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.click(screen.getByRole('button', { name: /discuss ship auth polish/i }))

    expect(screen.getByTestId('task-channel-drawer')).toBeInTheDocument()
    expect(screen.getByTestId('messaging-target')).toHaveTextContent(
      /messaging:\s*engineering \(assigned to this task\)/i,
    )
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

  it('highlights a board item when opened from the channel deep link', () => {
    render(
      <MemoryRouter initialEntries={['/tasks?focus=seed-auth']}>
        <TasksPage />
      </MemoryRouter>,
    )

    const card = screen.getByText(/ship auth polish/i).closest('[data-todo-id]') as HTMLElement
    expect(card).toHaveClass('tasks__sticky--focused')
    expect(card).toHaveAttribute('data-focused', 'true')
  })
})
