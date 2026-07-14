export const TODO_TAGS = [
  'Discovery',
  'Design',
  'Engineering',
  'Growth',
  'Bug',
] as const

export type TodoTag = (typeof TODO_TAGS)[number]

export const AGENTS = [
  { id: 'scout', name: 'Scout', initial: 'S' },
  { id: 'forge', name: 'Forge', initial: 'F' },
  { id: 'nova', name: 'Nova', initial: 'N' },
  { id: 'atlas', name: 'Atlas', initial: 'A' },
] as const

export type AgentId = (typeof AGENTS)[number]['id']

export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Queued', tone: 'coral' },
  { id: 'in_progress', title: 'Agents Working', tone: 'gold' },
  { id: 'review', title: 'Needs Your Review', tone: 'mint' },
  { id: 'done', title: 'Shipped by Agents', tone: 'sky' },
] as const

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]['id']

export type TodoStatus = KanbanColumnId

export type Todo = {
  id: string
  title: string
  status: KanbanColumnId
  tags: TodoTag[]
  agentId: AgentId
}

export type TagFilter = 'all' | TodoTag

export const STICKY_TONES = ['lemon', 'peach', 'mint', 'sky', 'lilac'] as const

export type StickyTone = (typeof STICKY_TONES)[number]

export function stickyToneFor(id: string): StickyTone {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % STICKY_TONES.length
  }
  return STICKY_TONES[hash]
}

export function agentFor(id: string): (typeof AGENTS)[number] {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 3)) % AGENTS.length
  }
  return AGENTS[hash]
}

export function getAgent(agentId: AgentId) {
  return AGENTS.find((agent) => agent.id === agentId) ?? AGENTS[0]
}
