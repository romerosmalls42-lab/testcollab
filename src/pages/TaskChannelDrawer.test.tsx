import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ComponentProps } from 'react'
import { TaskChannelDrawer } from './TaskChannelDrawer'
import type { Todo } from '../types/todo'

const engineeringTodo: Todo = {
  id: 'seed-checkout',
  title: 'Fix checkout crash on retry',
  status: 'in_progress',
  tags: ['Bug', 'Engineering'],
  departmentId: 'engineering',
}

function renderDrawer(
  props: Partial<ComponentProps<typeof TaskChannelDrawer>> = {},
) {
  const onClose = props.onClose ?? vi.fn()
  const onStatusChange = props.onStatusChange ?? vi.fn()
  return {
    onClose,
    onStatusChange,
    ...render(
      <MemoryRouter>
        <TaskChannelDrawer
          todo={props.todo === undefined ? engineeringTodo : props.todo}
          open={props.open ?? true}
          onClose={onClose}
          onStatusChange={onStatusChange}
        />
      </MemoryRouter>,
    ),
  }
}

describe('TaskChannelDrawer', () => {
  it('opens a task-anchored channel with the assigned department', () => {
    renderDrawer()

    expect(screen.getByRole('dialog', { name: /fix checkout crash on retry/i })).toBeInTheDocument()
    expect(screen.getByTestId('messaging-target')).toHaveTextContent(
      /messaging:\s*engineering \(assigned to this task\)/i,
    )
    expect(screen.getByText(/assigned to engineering/i)).toBeInTheDocument()
  })

  it('sends messages only to the assigned department and merges status into the timeline', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { onStatusChange } = renderDrawer()

    await user.type(
      screen.getByLabelText(/message engineering/i),
      'Please harden the retry path before review.',
    )
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    const feed = screen.getByTestId('task-channel-feed')
    expect(
      within(feed).getByText(/please harden the retry path before review/i),
    ).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(600)

    await waitFor(() => {
      expect(within(feed).getByText(/engineering on it/i)).toBeInTheDocument()
    })
    expect(within(feed).getByTestId('status-event')).toBeInTheDocument()
    expect(
      within(feed).getByText(/engineering moved this task to needs your review/i),
    ).toBeInTheDocument()
    expect(onStatusChange).toHaveBeenCalledWith('seed-checkout', 'review')

    vi.useRealTimers()
  })

  it('does not render when closed', () => {
    renderDrawer({ open: false })
    expect(screen.queryByTestId('task-channel-drawer')).not.toBeInTheDocument()
  })
})
