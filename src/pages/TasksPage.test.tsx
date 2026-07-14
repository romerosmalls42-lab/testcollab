import { describe, it, expect } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TasksPage } from './TasksPage'

function renderTasks(tagFilter: 'all' | 'Discovery' | 'Design' | 'Engineering' | 'Growth' | 'Bug' = 'all') {
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
  it('shows product Kanban columns', () => {
    renderTasks()

    expect(screen.getByRole('heading', { name: /product board/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^backlog$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^in progress$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^review$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^done$/i })).toBeInTheDocument()
  })

  it('renders tags on work items', () => {
    renderTasks()

    const card = screen
      .getByText(/validate pricing hypothesis/i)
      .closest('[data-todo-id]') as HTMLElement
    expect(within(card).getByText(/^discovery$/i)).toBeInTheDocument()
  })

  it('adds a tagged work item to Backlog', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.type(screen.getByLabelText(/new work item/i), 'Map checkout funnel')
    await user.selectOptions(screen.getByLabelText(/^tag$/i), 'Growth')
    await user.click(screen.getByRole('button', { name: /^add$/i }))

    const backlog = screen.getByRole('region', { name: /^backlog$/i })
    const card = within(backlog).getByText(/map checkout funnel/i).closest('[data-todo-id]')
    expect(card).toBeTruthy()
    expect(within(card as HTMLElement).getByText(/^growth$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/new work item/i)).toHaveValue('')
  })

  it('drags a card from Backlog into In Progress', () => {
    renderTasks()

    const card = screen.getByText(/validate pricing hypothesis/i).closest('[data-todo-id]')!
    const inProgress = screen.getByRole('region', { name: /^in progress$/i })
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.dragOver(inProgress, { dataTransfer })
    fireEvent.drop(inProgress, { dataTransfer })

    expect(within(inProgress).getByText(/validate pricing hypothesis/i)).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: /^backlog$/i })).queryByText(
        /validate pricing hypothesis/i,
      ),
    ).not.toBeInTheDocument()
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
