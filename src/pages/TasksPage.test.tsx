import { describe, it, expect } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TasksPage } from './TasksPage'

function renderTasks() {
  return render(
    <MemoryRouter>
      <TasksPage />
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

describe('TasksPage', () => {
  it('shows To do and Done sections', () => {
    renderTasks()

    expect(screen.getByRole('region', { name: /^to do$/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /^done$/i })).toBeInTheDocument()
  })

  it('lets a user add a task to the To do section', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.type(screen.getByLabelText(/new task/i), 'Buy oat milk')
    await user.click(screen.getByRole('button', { name: /^add$/i }))

    expect(
      within(screen.getByRole('region', { name: /^to do$/i })).getByText(/buy oat milk/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/new task/i)).toHaveValue('')
  })

  it('moves a task to Done when its checkbox is clicked', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.type(screen.getByLabelText(/new task/i), 'Call the studio')
    await user.click(screen.getByRole('button', { name: /^add$/i }))
    await user.click(screen.getByRole('checkbox', { name: /call the studio/i }))

    expect(
      within(screen.getByRole('region', { name: /^done$/i })).getByText(/call the studio/i),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: /^to do$/i })).queryByText(/call the studio/i),
    ).not.toBeInTheDocument()
  })

  it('drags a task from To do into Done and updates state', () => {
    renderTasks()

    const task = screen.getByText(/ship the landing polish/i).closest('[data-todo-id]')!
    const done = screen.getByRole('region', { name: /^done$/i })
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(task, { dataTransfer })
    fireEvent.dragOver(done, { dataTransfer })
    fireEvent.drop(done, { dataTransfer })

    expect(within(done).getByText(/ship the landing polish/i)).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: /^to do$/i })).queryByText(
        /ship the landing polish/i,
      ),
    ).not.toBeInTheDocument()
  })

  it('drags a task from Done back into To do', () => {
    renderTasks()

    const task = screen.getByText(/draft the brief for luna/i).closest('[data-todo-id]')!
    const todoSection = screen.getByRole('region', { name: /^to do$/i })
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(task, { dataTransfer })
    fireEvent.dragOver(todoSection, { dataTransfer })
    fireEvent.drop(todoSection, { dataTransfer })

    expect(within(todoSection).getByText(/draft the brief for luna/i)).toBeInTheDocument()
  })

  it('removes a task when delete is pressed', async () => {
    const user = userEvent.setup()
    renderTasks()

    await user.click(screen.getByRole('button', { name: /delete draft the brief for luna/i }))

    expect(screen.queryByText(/draft the brief for luna/i)).not.toBeInTheDocument()
  })
})
