import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  authorInitial,
  authorLabel,
  createStatusChangeMessage,
  createTaskMessage,
  formatMessageTime,
  formatStatusLabel,
  nextStatusAfterCommitment,
  replyAsDepartment,
  seedMessagesForTodo,
  type TaskMessage,
} from '../types/channel'
import { getDepartment, type KanbanColumnId, type Todo } from '../types/todo'
import './TaskChannelDrawer.css'

export type TaskChannelDrawerProps = {
  todo: Todo | null
  open: boolean
  onClose: () => void
  onStatusChange: (todoId: string, status: KanbanColumnId) => void
}

export function TaskChannelDrawer({
  todo,
  open,
  onClose,
  onStatusChange,
}: TaskChannelDrawerProps) {
  const [messagesByTodo, setMessagesByTodo] = useState<Record<string, TaskMessage[]>>({})
  const [draft, setDraft] = useState('')
  const feedRef = useRef<HTMLDivElement>(null)
  const replyTimer = useRef<number | null>(null)

  const messages = todo ? (messagesByTodo[todo.id] ?? seedMessagesForTodo(todo)) : []
  const department = todo ? getDepartment(todo.departmentId) : null

  useEffect(() => {
    if (!todo) return
    setMessagesByTodo((current) => {
      if (current[todo.id]) return current
      return { ...current, [todo.id]: seedMessagesForTodo(todo) }
    })
    setDraft('')
  }, [todo])

  useEffect(() => {
    const node = feedRef.current
    if (node && typeof node.scrollTo === 'function') {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
    }
  }, [messages.length, todo?.id, open])

  useEffect(() => {
    return () => {
      if (replyTimer.current !== null) window.clearTimeout(replyTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function appendMessages(todoId: string, next: TaskMessage[]) {
    setMessagesByTodo((current) => {
      const existing = current[todoId] ?? []
      return { ...current, [todoId]: [...existing, ...next] }
    })
  }

  function scheduleDepartmentReply(active: Todo) {
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current)
    replyTimer.current = window.setTimeout(() => {
      const reply = replyAsDepartment({
        departmentId: active.departmentId,
        todoId: active.id,
        title: active.title,
      })
      const nextStatus = nextStatusAfterCommitment(active.status)
      const timeline: TaskMessage[] = [reply]

      if (nextStatus) {
        timeline.push(
          createStatusChangeMessage({
            todoId: active.id,
            departmentId: active.departmentId,
            from: active.status,
            to: nextStatus,
          }),
        )
        onStatusChange(active.id, nextStatus)
      }

      appendMessages(active.id, timeline)
    }, 500)
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!todo) return
    const body = draft.trim()
    if (!body) return

    appendMessages(todo.id, [
      createTaskMessage({
        todoId: todo.id,
        authorId: 'you',
        body,
      }),
    ])
    setDraft('')
    scheduleDepartmentReply(todo)
  }

  if (!open || !todo || !department) return null

  return (
    <div className="task-channel" data-testid="task-channel-drawer">
      <button
        type="button"
        className="task-channel__backdrop"
        aria-label="Close task channel"
        onClick={onClose}
      />
      <aside
        className="task-channel__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-channel-title"
      >
        <header className="task-channel__header">
          <div className="task-channel__header-copy">
            <p className="task-channel__kicker">Task channel</p>
            <h2 id="task-channel-title" className="task-channel__title">
              {todo.title}
            </h2>
            <p className="task-channel__dept" data-department={department.id}>
              <span
                className="task-channel__avatar"
                data-department={department.id}
                aria-hidden="true"
              >
                {department.initial}
              </span>
              Assigned to {department.name}
            </p>
            <p className="task-channel__messaging" data-testid="messaging-target">
              Messaging: {department.name} (assigned to this task)
            </p>
            <p className="task-channel__status-line">
              Board status:{' '}
              <span className={`task-channel__status-pill task-channel__status-pill--${todo.status}`}>
                {formatStatusLabel(todo.status)}
              </span>
            </p>
          </div>
          <button type="button" className="task-channel__close" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="task-channel__feed" data-testid="task-channel-feed" ref={feedRef}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={
                message.kind === 'status' || message.kind === 'system'
                  ? 'task-channel__bubble task-channel__bubble--status'
                  : message.authorId === 'you'
                    ? 'task-channel__bubble task-channel__bubble--you'
                    : 'task-channel__bubble'
              }
              data-department={message.authorId}
              data-kind={message.kind}
            >
              {message.kind !== 'status' && (
                <div className="task-channel__meta">
                  <span
                    className="task-channel__avatar task-channel__avatar--sm"
                    data-department={message.authorId}
                    aria-hidden="true"
                  >
                    {authorInitial(message.authorId)}
                  </span>
                  <span className="task-channel__author">{authorLabel(message.authorId)}</span>
                  <time
                    className="task-channel__time"
                    dateTime={message.createdAt}
                    data-testid="message-time"
                  >
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              )}
              <p className="task-channel__body">{message.body}</p>
              {message.statusChange && (
                <p className="task-channel__status-event" data-testid="status-event">
                  {formatStatusLabel(message.statusChange.from)} →{' '}
                  {formatStatusLabel(message.statusChange.to)}
                </p>
              )}
            </article>
          ))}
        </div>

        <form className="task-channel__composer" onSubmit={sendMessage}>
          <label className="visually-hidden" htmlFor="task-channel-message">
            Message {department.name}
          </label>
          <input
            id="task-channel-message"
            className="task-channel__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Message ${department.name}…`}
            autoComplete="off"
          />
          <button type="submit" className="task-channel__send">
            Send
          </button>
        </form>
      </aside>
    </div>
  )
}
