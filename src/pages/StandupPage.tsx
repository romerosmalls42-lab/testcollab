import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  SEED_STANDUP_MESSAGES,
  authorInitial,
  authorLabel,
  createStandupMessage,
  formatMessageTime,
  type StandupMessage,
} from '../types/channel'
import { DEPARTMENTS } from '../types/todo'
import './StandupPage.css'

export function StandupPage() {
  const [messages, setMessages] = useState<StandupMessage[]>(SEED_STANDUP_MESSAGES)
  const [draft, setDraft] = useState('')

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    setMessages((current) => [
      ...current,
      createStandupMessage({ authorId: 'you', body }),
      createStandupMessage({
        authorId: 'operations',
        body: 'Operations noted. Departments can follow up on their task cards for execution detail.',
      }),
    ])
    setDraft('')
  }

  return (
    <div className="standup">
      <header className="standup__header">
        <div>
          <p className="standup__kicker">Cross-department</p>
          <h1 className="standup__title">Department Standup</h1>
          <p className="standup__subtitle">
            A lightweight space for sync across Engineering, Design, Marketing, Sales, and
            Operations. Task-specific discussion stays on each Mission Control card.
          </p>
        </div>
        <Link className="standup__link" to="/tasks">
          Back to board
        </Link>
      </header>

      <div className="standup__layout">
        <section className="standup__roster" aria-label="Departments">
          <h2 className="standup__section-title">Departments</h2>
          <ul className="standup__depts">
            {DEPARTMENTS.map((dept) => (
              <li key={dept.id} className="standup__dept" data-department={dept.id}>
                <span className="standup__avatar" data-department={dept.id} aria-hidden="true">
                  {dept.initial}
                </span>
                {dept.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="standup__main" aria-label="Standup conversation">
          <div className="standup__feed" data-testid="standup-feed">
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.authorId === 'you'
                    ? 'standup__bubble standup__bubble--you'
                    : 'standup__bubble'
                }
                data-department={message.authorId}
              >
                <div className="standup__meta">
                  <span
                    className="standup__avatar standup__avatar--sm"
                    data-department={message.authorId}
                    aria-hidden="true"
                  >
                    {authorInitial(message.authorId)}
                  </span>
                  <span className="standup__author">{authorLabel(message.authorId)}</span>
                  <time className="standup__time" dateTime={message.createdAt}>
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <p className="standup__body">{message.body}</p>
              </article>
            ))}
          </div>

          <form className="standup__composer" onSubmit={send}>
            <label className="visually-hidden" htmlFor="standup-message">
              Message the standup
            </label>
            <input
              id="standup-message"
              className="standup__input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Share a cross-department update…"
              autoComplete="off"
            />
            <button type="submit" className="standup__send">
              Send
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
