import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AGENTS, type AgentId } from '../types/todo'
import {
  BOARD_TASKS,
  CHANNEL_TOPICS,
  activeBoardTasks,
  authorInitial,
  authorLabel,
  boardDeepLink,
  createChannelMessage,
  createMeeting,
  createTopic,
  deriveAgentPresence,
  filterBoardTasks,
  formatMessageTime,
  formatStatusLabel,
  replyAsAgent,
  type BoardLink,
  type BoardTask,
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
    boardLink: BOARD_TASKS.find((task) => task.todoId === 'seed-empty'),
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
  if (attached?.agentId) return attached.agentId
  if (attached) {
    const match = BOARD_TASKS.find((item) => item.todoId === attached.todoId)
    if (match) return match.agentId
  }
  const index = Math.floor(Math.random() * AGENTS.length)
  return AGENTS[index].id
}

function agentClass(authorId: string) {
  return authorId === 'you' ? 'you' : authorId
}

function BoardPreviewCard({ link }: { link: BoardLink }) {
  return (
    <Link
      className="channel__board-card"
      to={boardDeepLink(link.todoId)}
      data-testid="board-preview"
      data-status={link.status}
    >
      <span className="channel__board-card-kicker">Board</span>
      <span className="channel__board-card-title">{link.title}</span>
      <span className={`channel__status-pill channel__status-pill--${link.status}`}>
        {formatStatusLabel(link.status)}
      </span>
    </Link>
  )
}

export function ChannelPage() {
  const [topics, setTopics] = useState<ChannelTopic[]>(CHANNEL_TOPICS)
  const [activeTopic, setActiveTopic] = useState(CHANNEL_TOPICS[0].slug)
  const [messages, setMessages] = useState<ChannelMessage[]>(SEED_MESSAGES)
  const [draft, setDraft] = useState('')
  const [attached, setAttached] = useState<BoardTask | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [topicComposerOpen, setTopicComposerOpen] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')
  const [liveMeeting, setLiveMeeting] = useState<ChannelMeeting | null>(null)
  const [visitedTopics, setVisitedTopics] = useState<Set<string>>(
    () => new Set([CHANNEL_TOPICS[0].slug]),
  )
  const feedRef = useRef<HTMLDivElement>(null)
  const replyTimer = useRef<number | null>(null)
  const searchId = useId()
  const dialogTitleId = useId()

  const topicMessages = messages.filter((message) => message.topicSlug === activeTopic)
  const activeTopicMeta = topics.find((topic) => topic.slug === activeTopic)
  const workingTasks = useMemo(() => activeBoardTasks(BOARD_TASKS), [])
  const filteredTasks = useMemo(
    () => filterBoardTasks(pickerQuery, BOARD_TASKS),
    [pickerQuery],
  )

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

  function unreadCount(slug: string) {
    if (visitedTopics.has(slug) || slug === activeTopic) return 0
    return messages.filter((message) => message.topicSlug === slug).length
  }

  function selectTopic(slug: string) {
    setActiveTopic(slug)
    setVisitedTopics((current) => new Set(current).add(slug))
  }

  function scheduleAgentReply(topicSlug: string, boardLink: BoardLink | null, hint: string) {
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current)
    const agentId = pickReplyAgent(boardLink)
    const aboutTitle = boardLink?.title ?? (hint.slice(0, 48) || 'your brief')
    replyTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        replyAsAgent({
          agentId,
          topicSlug,
          aboutTitle,
          boardLink: boardLink ?? undefined,
        }),
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
    setPickerQuery('')
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
    selectTopic(topic.slug)
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

  function openPicker() {
    setPickerOpen(true)
    setPickerQuery('')
  }

  function closePicker() {
    setPickerOpen(false)
    setPickerQuery('')
  }

  function selectBoardTask(task: BoardTask) {
    setAttached(task)
    closePicker()
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
              <li className="channel__member" data-testid="member-you" data-agent="you">
                <span className="channel__avatar" data-agent="you" aria-hidden="true">
                  Y
                </span>
                <div className="channel__member-copy">
                  <span className="channel__member-name">You</span>
                </div>
                <span
                  className="channel__presence"
                  data-testid="presence-dot"
                  data-status="idle"
                  title="Idle"
                />
              </li>
              {AGENTS.map((agent) => {
                const presence = deriveAgentPresence(agent.id, BOARD_TASKS)
                return (
                  <li
                    key={agent.id}
                    className="channel__member"
                    data-testid={`member-${agent.id}`}
                    data-agent={agent.id}
                  >
                    <span
                      className="channel__avatar"
                      data-agent={agent.id}
                      aria-hidden="true"
                    >
                      {agent.initial}
                    </span>
                    <div className="channel__member-copy">
                      <span className="channel__member-name">{agent.name}</span>
                      {presence.status === 'working' && presence.taskTitle && (
                        <span className="channel__member-task">on: {presence.taskTitle}</span>
                      )}
                      {presence.status === 'away' && (
                        <span className="channel__member-task">Away</span>
                      )}
                    </div>
                    <span
                      className="channel__presence"
                      data-testid="presence-dot"
                      data-status={presence.status}
                      title={presence.status}
                    />
                  </li>
                )
              })}
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
              <p className="channel__meeting-status">
                Live · {liveMeeting.participantIds.length} present
              </p>
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
              {topics.map((topic) => {
                const unread = unreadCount(topic.slug)
                return (
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
                    onClick={() => selectTopic(topic.slug)}
                  >
                    <span>#{topic.name}</span>
                    {unread > 0 && (
                      <span className="channel__topic-unread" data-testid="topic-unread">
                        {unread}
                      </span>
                    )}
                  </button>
                )
              })}
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
              topicMessages.map((message) => {
                const agent = agentClass(message.authorId)
                const bubbleClass =
                  message.kind === 'meeting' || message.kind === 'system'
                    ? 'channel__bubble channel__bubble--system'
                    : message.authorId === 'you'
                      ? 'channel__bubble channel__bubble--you'
                      : 'channel__bubble'

                return (
                  <article
                    key={message.id}
                    className={bubbleClass}
                    data-agent={agent}
                  >
                    <div className="channel__bubble-meta">
                      <span
                        className="channel__avatar channel__avatar--sm"
                        data-agent={agent}
                        aria-hidden="true"
                      >
                        {authorInitial(message.authorId)}
                      </span>
                      <span className="channel__author" data-agent={agent}>
                        {authorLabel(message.authorId)}
                      </span>
                      <time
                        className="channel__time"
                        dateTime={message.createdAt}
                        data-testid="message-time"
                      >
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                    <p className="channel__body">{message.body}</p>
                    {message.boardLink && <BoardPreviewCard link={message.boardLink} />}
                  </article>
                )
              })
            )}
          </div>

          <form className="channel__composer" onSubmit={sendMessage}>
            <div className="channel__composer-field">
              {attached && (
                <span className="channel__mention-chip" data-testid="composer-task-chip">
                  <span className="channel__mention-kicker">@</span>
                  <span className="channel__mention-title">{attached.title}</span>
                  <button
                    type="button"
                    className="channel__mention-remove"
                    aria-label="Remove linked board item"
                    onClick={() => setAttached(null)}
                  >
                    ×
                  </button>
                </span>
              )}
              <label className="visually-hidden" htmlFor="channel-message">
                Message the channel
              </label>
              <input
                id="channel-message"
                className="channel__input channel__input--composer"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message your agents…"
                autoComplete="off"
              />
            </div>
            <div className="channel__composer-row">
              <button
                type="button"
                className="channel__btn channel__btn--ghost"
                onClick={openPicker}
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
              >
                Link board item
              </button>
              <button type="submit" className="channel__btn channel__btn--gold">
                Send
              </button>
            </div>
          </form>
        </section>

        <aside className="channel__rail">
          <section className="channel__panel channel__panel--active" aria-label="Active tasks">
            <h2 className="channel__panel-title">Active tasks</h2>
            <p className="channel__rail-hint">Live from Mission Control</p>
            {workingTasks.length === 0 ? (
              <p className="channel__empty">No agents executing right now.</p>
            ) : (
              <ul className="channel__active-list">
                {workingTasks.map((task) => (
                  <li key={task.todoId} className="channel__active-item" data-agent={task.agentId}>
                    <span
                      className="channel__avatar channel__avatar--sm"
                      data-agent={task.agentId}
                      aria-hidden="true"
                    >
                      {authorInitial(task.agentId)}
                    </span>
                    <div className="channel__active-copy">
                      <Link className="channel__active-title" to={boardDeepLink(task.todoId)}>
                        {task.title}
                      </Link>
                      <span className="channel__active-agent">{authorLabel(task.agentId)}</span>
                    </div>
                    <span className="channel__status-pill channel__status-pill--in_progress">
                      Working
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {pickerOpen && (
        <div className="channel__modal-root">
          <button
            type="button"
            className="channel__modal-backdrop"
            aria-label="Close board item picker"
            onClick={closePicker}
          />
          <div
            className="channel__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            <div className="channel__modal-head">
              <h2 id={dialogTitleId} className="channel__modal-title">
                Link a board item
              </h2>
              <button type="button" className="channel__text-btn" onClick={closePicker}>
                Close
              </button>
            </div>
            <label className="channel__label" htmlFor={searchId}>
              Search board tasks
            </label>
            <input
              id={searchId}
              className="channel__input"
              value={pickerQuery}
              onChange={(event) => setPickerQuery(event.target.value)}
              placeholder="Search by title, agent, or status…"
              autoComplete="off"
              autoFocus
            />
            <div
              className="channel__picker"
              role="listbox"
              aria-label="Board items to discuss"
            >
              {filteredTasks.length === 0 ? (
                <p className="channel__empty">No tasks match that search.</p>
              ) : (
                filteredTasks.map((item) => (
                  <button
                    key={item.todoId}
                    type="button"
                    role="option"
                    className="channel__picker-option"
                    aria-selected={attached?.todoId === item.todoId}
                    onClick={() => selectBoardTask(item)}
                  >
                    <span className="channel__picker-main">
                      <span>{item.title}</span>
                      <span className="channel__picker-agent">{authorLabel(item.agentId)}</span>
                    </span>
                    <span className={`channel__status-pill channel__status-pill--${item.status}`}>
                      {formatStatusLabel(item.status)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
