import {
  DEPARTMENTS,
  KANBAN_COLUMNS,
  type DepartmentId,
  type KanbanColumnId,
  type Todo,
} from './todo'

export type ChannelAuthorId = 'you' | DepartmentId

export type TaskMessageKind = 'chat' | 'status' | 'system'

export type TaskMessage = {
  id: string
  todoId: string
  authorId: ChannelAuthorId
  body: string
  kind: TaskMessageKind
  createdAt: string
  statusChange?: {
    from: KanbanColumnId
    to: KanbanColumnId
  }
}

export type StandupMessage = {
  id: string
  authorId: ChannelAuthorId
  body: string
  kind: 'chat' | 'system'
  createdAt: string
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
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
  return KANBAN_COLUMNS.find((column) => column.id === status)?.title ?? status
}

export function authorLabel(authorId: ChannelAuthorId) {
  if (authorId === 'you') return 'You'
  return DEPARTMENTS.find((dept) => dept.id === authorId)?.name ?? authorId
}

export function authorInitial(authorId: ChannelAuthorId) {
  if (authorId === 'you') return 'Y'
  return DEPARTMENTS.find((dept) => dept.id === authorId)?.initial ?? '?'
}

export function createTaskMessage(input: {
  todoId: string
  authorId: ChannelAuthorId
  body: string
  kind?: TaskMessageKind
  createdAt?: string
  statusChange?: TaskMessage['statusChange']
}): TaskMessage {
  return {
    id: createId('msg'),
    todoId: input.todoId,
    authorId: input.authorId,
    body: input.body.trim(),
    kind: input.kind ?? 'chat',
    createdAt: input.createdAt ?? new Date().toISOString(),
    statusChange: input.statusChange,
  }
}

export function createStatusChangeMessage(input: {
  todoId: string
  departmentId: DepartmentId
  from: KanbanColumnId
  to: KanbanColumnId
}): TaskMessage {
  const dept = authorLabel(input.departmentId)
  const toLabel = formatStatusLabel(input.to)
  return createTaskMessage({
    todoId: input.todoId,
    authorId: input.departmentId,
    body: `${dept} moved this task to ${toLabel}`,
    kind: 'status',
    statusChange: { from: input.from, to: input.to },
  })
}

const DEPARTMENT_REPLY: Record<DepartmentId, (title: string) => string> = {
  engineering: (title) =>
    `Engineering on it. We'll harden the implementation behind "${title}" and ping when ready for review.`,
  design: (title) =>
    `Design reviewing "${title}". We'll polish the experience and push an update for revision.`,
  marketing: (title) =>
    `Marketing tracking "${title}". We'll sync growth copy and drop notes after review.`,
  sales: (title) =>
    `Sales on "${title}". We'll advance outreach and report pipeline movement.`,
  operations: (title) =>
    `Operations here — coordinating on "${title}" and surfacing anything that needs a decision.`,
}

export function replyAsDepartment(input: {
  departmentId: DepartmentId
  todoId: string
  title: string
}): TaskMessage {
  return createTaskMessage({
    todoId: input.todoId,
    authorId: input.departmentId,
    body: DEPARTMENT_REPLY[input.departmentId](input.title),
  })
}

/** When a department commits in chat, advance the task toward review when appropriate. */
export function nextStatusAfterCommitment(
  current: KanbanColumnId,
): KanbanColumnId | null {
  if (current === 'backlog') return 'in_progress'
  if (current === 'in_progress') return 'review'
  return null
}

export function seedMessagesForTodo(todo: Todo): TaskMessage[] {
  const dept = todo.departmentId
  return [
    createTaskMessage({
      todoId: todo.id,
      authorId: dept,
      body: `${authorLabel(dept)} is assigned to this task. Message us here for discussion or revision asks.`,
      createdAt: '2026-07-14T12:00:00.000Z',
    }),
  ]
}

export function createStandupMessage(input: {
  authorId: ChannelAuthorId
  body: string
  kind?: StandupMessage['kind']
  createdAt?: string
}): StandupMessage {
  return {
    id: createId('standup'),
    authorId: input.authorId,
    body: input.body.trim(),
    kind: input.kind ?? 'chat',
    createdAt: input.createdAt ?? new Date().toISOString(),
  }
}

export const SEED_STANDUP_MESSAGES: StandupMessage[] = [
  createStandupMessage({
    authorId: 'operations',
    body: 'Department standup is open. Share blockers or wins — this is cross-team, not tied to a single board card.',
    createdAt: '2026-07-14T12:00:00.000Z',
  }),
  createStandupMessage({
    authorId: 'engineering',
    body: 'Checkout crash fix is in progress; auth polish is waiting on your review.',
    createdAt: '2026-07-14T12:05:00.000Z',
  }),
  createStandupMessage({
    authorId: 'design',
    body: 'Empty-state redesign is mid-polish — ping Design on that card if copy needs another pass.',
    createdAt: '2026-07-14T12:08:00.000Z',
  }),
]
