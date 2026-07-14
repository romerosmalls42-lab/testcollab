import { AGENTS, type AgentId, type KanbanColumnId } from './todo'

export type ChannelAuthorId = 'you' | AgentId

export type ChannelTopic = {
  slug: string
  name: string
}

export type BoardLink = {
  todoId: string
  title: string
  status: KanbanColumnId
  agentId?: AgentId
}

export type BoardTask = BoardLink & {
  agentId: AgentId
}

export type AgentPresenceStatus = 'idle' | 'working' | 'away'

export type AgentPresence = {
  status: AgentPresenceStatus
  taskTitle?: string
}

export type ChannelMessageKind = 'chat' | 'system' | 'meeting'

export type ChannelMessage = {
  id: string
  topicSlug: string
  authorId: ChannelAuthorId
  body: string
  kind: ChannelMessageKind
  createdAt: string
  boardLink?: BoardLink
  meetingId?: string
}

export type MeetingStatus = 'scheduled' | 'live' | 'ended'

export type ChannelMeeting = {
  id: string
  title: string
  topicSlug: string
  participantIds: ChannelAuthorId[]
  status: MeetingStatus
  startedAt: string
}

/** Distinct accents inside the gold/black system — Slack-style teammate identity. */
export const AGENT_ACCENTS: Record<AgentId, string> = {
  scout: '#6ea8d9',
  forge: '#e0a45a',
  nova: '#d4a0c7',
  atlas: '#7eb8a2',
}

export const CHANNEL_TOPICS: ChannelTopic[] = [
  { slug: 'general', name: 'General' },
  { slug: 'revisions', name: 'Revisions' },
  { slug: 'standup', name: 'Standup' },
]

export const BOARD_TASKS: BoardTask[] = [
  {
    todoId: 'seed-pricing',
    title: 'Validate pricing hypothesis',
    status: 'backlog',
    agentId: 'scout',
  },
  {
    todoId: 'seed-empty',
    title: 'Redesign empty states',
    status: 'in_progress',
    agentId: 'nova',
  },
  {
    todoId: 'seed-auth',
    title: 'Ship auth polish',
    status: 'review',
    agentId: 'forge',
  },
  {
    todoId: 'seed-waitlist',
    title: 'Launch waitlist email',
    status: 'done',
    agentId: 'atlas',
  },
  {
    todoId: 'seed-checkout',
    title: 'Fix checkout crash on retry',
    status: 'in_progress',
    agentId: 'forge',
  },
]

/** @deprecated Prefer BOARD_TASKS — kept for call sites that only need discussable items. */
export const DISCUSSABLE_BOARD_ITEMS: BoardLink[] = BOARD_TASKS

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function boardDeepLink(todoId: string) {
  return `/tasks?focus=${encodeURIComponent(todoId)}`
}

export function createBoardLink(input: BoardLink): BoardLink {
  return {
    todoId: input.todoId,
    title: input.title,
    status: input.status,
    agentId: input.agentId,
  }
}

export function createTopic(input: { name: string; slug: string }): ChannelTopic {
  return {
    name: input.name.trim(),
    slug: input.slug.trim().toLowerCase().replace(/\s+/g, '-'),
  }
}

export function createChannelMessage(input: {
  topicSlug: string
  authorId: ChannelAuthorId
  body: string
  kind?: ChannelMessageKind
  boardLink?: BoardLink
  meetingId?: string
  createdAt?: string
}): ChannelMessage {
  return {
    id: createId('msg'),
    topicSlug: input.topicSlug,
    authorId: input.authorId,
    body: input.body.trim(),
    kind: input.kind ?? 'chat',
    createdAt: input.createdAt ?? new Date().toISOString(),
    boardLink: input.boardLink,
    meetingId: input.meetingId,
  }
}

export function createMeeting(input: {
  title: string
  topicSlug: string
  participantIds: ChannelAuthorId[]
  status?: MeetingStatus
}): ChannelMeeting {
  return {
    id: createId('meet'),
    title: input.title.trim(),
    topicSlug: input.topicSlug,
    participantIds: input.participantIds,
    status: input.status ?? 'live',
    startedAt: new Date().toISOString(),
  }
}

const AGENT_REPLY_TEMPLATES: Record<AgentId, (title: string) => string> = {
  scout: (title) =>
    `Scout here — I'll dig into "${title}" and surface findings for revision.`,
  forge: (title) =>
    `Forge on it. I'll harden the implementation behind "${title}" and ping when ready for review.`,
  nova: (title) =>
    `Nova reviewing "${title}". I'll polish the empty-state experience and push an update for revision.`,
  atlas: (title) =>
    `Atlas tracking "${title}". I'll sync growth implications and drop notes after review.`,
}

export function replyAsAgent(input: {
  agentId: AgentId
  topicSlug: string
  aboutTitle: string
  boardLink?: BoardLink
}): ChannelMessage {
  const template = AGENT_REPLY_TEMPLATES[input.agentId]
  return createChannelMessage({
    topicSlug: input.topicSlug,
    authorId: input.agentId,
    body: template(input.aboutTitle),
    boardLink: input.boardLink,
  })
}

export function authorLabel(authorId: ChannelAuthorId) {
  if (authorId === 'you') return 'You'
  return AGENTS.find((agent) => agent.id === authorId)?.name ?? authorId
}

export function authorInitial(authorId: ChannelAuthorId) {
  if (authorId === 'you') return 'Y'
  return AGENTS.find((agent) => agent.id === authorId)?.initial ?? '?'
}

export function formatMessageTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatStatusLabel(status: KanbanColumnId) {
  switch (status) {
    case 'backlog':
      return 'Queued'
    case 'in_progress':
      return 'Agents Working'
    case 'review':
      return 'Needs Review'
    case 'done':
      return 'Shipped'
  }
}

export function deriveAgentPresence(
  agentId: AgentId,
  board: BoardTask[] = BOARD_TASKS,
): AgentPresence {
  const owned = board.filter((task) => task.agentId === agentId)
  const working = owned.find((task) => task.status === 'in_progress')
  if (working) {
    return { status: 'working', taskTitle: working.title }
  }

  const hasOnlyShipped =
    owned.length > 0 && owned.every((task) => task.status === 'done')
  if (hasOnlyShipped) {
    return { status: 'away' }
  }

  return { status: 'idle' }
}

export function activeBoardTasks(board: BoardTask[] = BOARD_TASKS) {
  return board.filter((task) => task.status === 'in_progress')
}

export function filterBoardTasks(query: string, board: BoardTask[] = BOARD_TASKS) {
  const needle = query.trim().toLowerCase()
  if (!needle) return board
  return board.filter(
    (task) =>
      task.title.toLowerCase().includes(needle) ||
      task.status.toLowerCase().includes(needle) ||
      task.agentId.toLowerCase().includes(needle),
  )
}
