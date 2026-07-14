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
  it('shows a full-bleed Kanban board with sticky-note cards', () => {
    renderTasks()

    expect(screen.getByRole('heading', { name: /kanban board/i })).toBeInTheDocument()
    expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^backlog$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^doing$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^review$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^done$/i })).toBeInTheDocument()

    const card = screen
      .getByText(/validate pricing hypothesis/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(card).toHaveClass('tasks__sticky')
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
      screen.getByText(/pick a tag that matches the kind of work/i),
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

  it('adds a tagged sticky note to Backlog', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.type(screen.getByLabelText(/work item title/i), 'Map checkout funnel')
    await user.click(screen.getByRole('button', { name: /tag as growth/i }))
    await user.click(screen.getByRole('button', { name: /^add sticky note$/i }))

    const backlog = screen.getByRole('region', { name: /^backlog$/i })
    const card = within(backlog)
      .getByText(/map checkout funnel/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(card).toHaveClass('tasks__sticky')
    expect(within(card).getByText(/^growth$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/work item title/i)).toHaveValue('')
  })

  it('drags a sticky note from Backlog into Doing with a move animation', () => {
    renderTasks()

    const card = screen.getByText(/validate pricing hypothesis/i).closest('[data-todo-id]')!
    const doing = screen.getByRole('region', { name: /^doing$/i })
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.dragOver(doing, { dataTransfer })
    fireEvent.drop(doing, { dataTransfer })

    const moved = within(doing)
      .getByText(/validate pricing hypothesis/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(moved).toHaveClass('tasks__sticky--arriving')
    expect(
      within(screen.getByRole('region', { name: /^backlog$/i })).queryByText(
        /validate pricing hypothesis/i,
      ),
    ).not.toBeInTheDocument()
  })

  it('celebrates when a sticky note moves into Done', () => {
    renderTasks()

    const card = screen.getByText(/ship auth polish/i).closest('[data-todo-id]')!
    const done = screen.getByRole('region', { name: /^done$/i })
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
