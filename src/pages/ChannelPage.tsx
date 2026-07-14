import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AGENTS, type AgentId } from '../types/todo'
import {
  CHANNEL_TOPICS,
  DISCUSSABLE_BOARD_ITEMS,
  authorInitial,
  authorLabel,
  boardDeepLink,
  createChannelMessage,
  createMeeting,
  createTopic,
  replyAsAgent,
  type BoardLink,
  type ChannelMeeting,
  type ChannelMessage,
  type ChannelTopic,
} from '../types/channel'
import './ChannelPage.css'

const SEED_MESSAGES: ChannelMessage[] = [
  createChannelMessage({
    topicSlug: 'general',
    authorId: 'scout',
    body: 'Channel is live. Drop briefs, link board items, or start a meeting anytime.',
    createdAt: '2026-07-14T12:00:00.000Z',
  }),
  createChannelMessage({
    topicSlug: 'revisions',
    authorId: 'nova',
    body: 'Empty states are mid-polish. Ping me if copy needs another pass.',
    boardLink: DISCUSSABLE_BOARD_ITEMS[1],
    createdAt: '2026-07-14T12:05:00.000Z',
  }),
  createChannelMessage({
    topicSlug: 'standup',
    authorId: 'atlas',
    body: 'Standup thread ready — share blockers or wins for the day.',
    createdAt: '2026-07-14T12:10:00.000Z',
  }),
]

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function pickReplyAgent(attached: BoardLink | null): AgentId {
  if (attached) {
    const match = DISCUSSABLE_BOARD_ITEMS.find((item) => item.todoId === attached.todoId)
    if (match?.todoId === 'seed-empty') return 'nova'
    if (match?.todoId === 'seed-auth' || match?.todoId === 'seed-checkout') return 'forge'
    if (match?.todoId === 'seed-pricing') return 'scout'
  }
  const index = Math.floor(Math.random() * AGENTS.length)
  return AGENTS[index].id
}

export function ChannelPage() {
  const [topics, setTopics] = useState<ChannelTopic[]>(CHANNEL_TOPICS)
  const [activeTopic, setActiveTopic] = useState(CHANNEL_TOPICS[0].slug)
  const [messages, setMessages] = useState<ChannelMessage[]>(SEED_MESSAGES)
  const [draft, setDraft] = useState('')
  const [attached, setAttached] = useState<BoardLink | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [topicComposerOpen, setTopicComposerOpen] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [liveMeeting, setLiveMeeting] = useState<ChannelMeeting | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const replyTimer = useRef<number | null>(null)

  const topicMessages = messages.filter((message) => message.topicSlug === activeTopic)
  const activeTopicMeta = topics.find((topic) => topic.slug === activeTopic)

  useEffect(() => {
    const node = feedRef.current
    if (node && typeof node.scrollTo === 'function') {
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
    }
  }, [topicMessages.length, activeTopic])

  useEffect(() => {
    return () => {
      if (replyTimer.current !== null) window.clearTimeout(replyTimer.current)
    }
  }, [])

  function scheduleAgentReply(topicSlug: string, boardLink: BoardLink | null, hint: string) {
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current)
    const agentId = pickReplyAgent(boardLink)
    const aboutTitle = boardLink?.title ?? (hint.slice(0, 48) || 'your brief')
    replyTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        replyAsAgent({ agentId, topicSlug, aboutTitle }),
      ])
    }, 500)
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body && !attached) return

    const message = createChannelMessage({
      topicSlug: activeTopic,
      authorId: 'you',
      body: body || `Discussing: ${attached?.title}`,
      boardLink: attached ?? undefined,
    })

    setMessages((current) => [...current, message])
    setDraft('')
    const linked = attached
    setAttached(null)
    setPickerOpen(false)
    scheduleAgentReply(activeTopic, linked, body)
  }

  function handleCreateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newTopicName.trim()
    if (!name) return
    const slug = slugify(name)
    if (!slug || topics.some((topic) => topic.slug === slug)) return

    const topic = createTopic({ name, slug })
    setTopics((current) => [...current, topic])
    setActiveTopic(topic.slug)
    setNewTopicName('')
    setTopicComposerOpen(false)
    setMessages((current) => [
      ...current,
      createChannelMessage({
        topicSlug: topic.slug,
        authorId: 'you',
        body: `Opened #${topic.slug} for discussion.`,
        kind: 'system',
      }),
    ])
  }

  function startMeeting() {
    if (liveMeeting) return
    const meeting = createMeeting({
      title: `${activeTopicMeta?.name ?? 'Channel'} meeting`,
      topicSlug: activeTopic,
      participantIds: ['you', ...AGENTS.map((agent) => agent.id)],
    })
    setLiveMeeting(meeting)
    setMessages((current) => [
      ...current,
      createChannelMessage({
        topicSlug: activeTopic,
        authorId: 'you',
        body: `Meeting started: ${meeting.title}`,
        kind: 'meeting',
        meetingId: meeting.id,
      }),
    ])
  }

  function endMeeting() {
    if (!liveMeeting) return
    const endedTopic = liveMeeting.topicSlug
    setLiveMeeting(null)
    setMessages((current) => [
      ...current,
      createChannelMessage({
        topicSlug: endedTopic,
        authorId: 'you',
        body: 'Meeting ended. Notes stay in this topic.',
        kind: 'meeting',
      }),
    ])
  }

  return (
    <div className="channel">
      <header className="channel__hero">
        <div>
          <p className="channel__kicker">Group chat</p>
          <h1 className="channel__title">Agent Channel</h1>
          <p className="channel__subtitle">
            Talk with your agents like a group chat. Spin up virtual meetings, open topics,
            and link board items that need discussion or revision.
          </p>
        </div>
        <div className="channel__hero-actions">
          {liveMeeting ? (
            <button
              type="button"
              className="channel__btn channel__btn--danger"
              onClick={endMeeting}
            >
              End meeting
            </button>
          ) : (
            <button type="button" className="channel__btn channel__btn--gold" onClick={startMeeting}>
              Start meeting
            </button>
          )}
          <Link className="channel__btn channel__btn--ghost" to="/tasks">
            Open board
          </Link>
        </div>
      </header>

      <div className="channel__layout">
        <aside className="channel__sidebar">
          <section className="channel__panel" aria-label="Members">
            <h2 className="channel__panel-title">Members</h2>
            <ul className="channel__members">
              <li className="channel__member">
                <span className="channel__avatar" aria-hidden="true">
                  Y
                </span>
                <span>You</span>
                <span className="channel__presence" data-online="true" />
              </li>
              {AGENTS.map((agent) => (
                <li key={agent.id} className="channel__member">
                  <span className="channel__avatar" aria-hidden="true">
                    {agent.initial}
                  </span>
                  <span>{agent.name}</span>
                  <span className="channel__presence" data-online="true" />
                </li>
              ))}
            </ul>
          </section>

          {liveMeeting && (
            <section
              className="channel__panel channel__panel--live"
              aria-label="Live meeting"
              data-testid="live-meeting"
            >
              <h2 className="channel__panel-title">Live meeting</h2>
              <p className="channel__meeting-title">{liveMeeting.title}</p>
              <p className="channel__meeting-status">Live · {liveMeeting.participantIds.length} present</p>
            </section>
          )}

          <section className="channel__panel" aria-label="Topics">
            <div className="channel__panel-head">
              <h2 className="channel__panel-title">Topics</h2>
              <button
                type="button"
                className="channel__text-btn"
                onClick={() => setTopicComposerOpen((open) => !open)}
              >
                New topic
              </button>
            </div>
            <div className="channel__topics" role="tablist" aria-label="Discussion topics">
              {topics.map((topic) => (
                <button
                  key={topic.slug}
                  type="button"
                  role="tab"
                  aria-selected={activeTopic === topic.slug}
                  className={
                    activeTopic === topic.slug
                      ? 'channel__topic channel__topic--active'
                      : 'channel__topic'
                  }
                  onClick={() => setActiveTopic(topic.slug)}
                >
                  #{topic.name}
                </button>
              ))}
            </div>
            {topicComposerOpen && (
              <form className="channel__topic-form" onSubmit={handleCreateTopic}>
                <label className="channel__label" htmlFor="new-topic-name">
                  Topic name
                </label>
                <input
                  id="new-topic-name"
                  className="channel__input"
                  value={newTopicName}
                  onChange={(event) => setNewTopicName(event.target.value)}
                  placeholder="e.g. Launch week"
                  autoComplete="off"
                />
                <button type="submit" className="channel__btn channel__btn--gold">
                  Create topic
                </button>
              </form>
            )}
          </section>
        </aside>

        <section className="channel__main" aria-label="Conversation">
          <div className="channel__thread-head">
            <h2 className="channel__thread-title" data-testid="active-topic">
              #{activeTopicMeta?.name ?? activeTopic}
            </h2>
            <p className="channel__thread-hint">
              Discuss work, share revision asks, and keep agents in the loop.
            </p>
          </div>

          <div className="channel__feed" data-testid="channel-feed" ref={feedRef}>
            {topicMessages.length === 0 ? (
              <p className="channel__empty">No messages yet. Start the conversation.</p>
            ) : (
              topicMessages.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.kind === 'meeting' || message.kind === 'system'
                      ? 'channel__bubble channel__bubble--system'
                      : message.authorId === 'you'
                        ? 'channel__bubble channel__bubble--you'
                        : 'channel__bubble'
                  }
                >
                  <div className="channel__bubble-meta">
                    <span className="channel__avatar channel__avatar--sm" aria-hidden="true">
                      {authorInitial(message.authorId)}
                    </span>
                    <span className="channel__author">{authorLabel(message.authorId)}</span>
                  </div>
                  <p className="channel__body">{message.body}</p>
                  {message.boardLink && (
                    <Link
                      className="channel__board-chip"
                      to={boardDeepLink(message.boardLink.todoId)}
                    >
                      <span className="channel__board-chip-kicker">Board</span>
                      {message.boardLink.title}
                    </Link>
                  )}
                </article>
              ))
            )}
          </div>

          <form className="channel__composer" onSubmit={sendMessage}>
            {attached && (
              <div className="channel__attachment">
                <span>Linked: {attached.title}</span>
                <button
                  type="button"
                  className="channel__text-btn"
                  onClick={() => setAttached(null)}
                >
                  Remove
                </button>
              </div>
            )}
            {pickerOpen && (
              <div
                className="channel__picker"
                role="listbox"
                aria-label="Board items to discuss"
              >
                {DISCUSSABLE_BOARD_ITEMS.map((item) => (
                  <button
                    key={item.todoId}
                    type="button"
                    role="option"
                    className="channel__picker-option"
                    aria-selected={attached?.todoId === item.todoId}
                    onClick={() => {
                      setAttached(item)
                      setPickerOpen(false)
                    }}
                  >
                    <span>{item.title}</span>
                    <span className="channel__picker-status">{item.status.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="channel__composer-row">
              <button
                type="button"
                className="channel__btn channel__btn--ghost"
                onClick={() => setPickerOpen((open) => !open)}
              >
                Link board item
              </button>
              <label className="visually-hidden" htmlFor="channel-message">
                Message the channel
              </label>
              <input
                id="channel-message"
                className="channel__input channel__input--grow"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message your agents…"
                autoComplete="off"
              />
              <button type="submit" className="channel__btn channel__btn--gold">
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
