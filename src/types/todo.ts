export const TODO_TAGS = [
  'Discovery',
  'Design',
  'Engineering',
  'Growth',
  'Bug',
] as const

export type TodoTag = (typeof TODO_TAGS)[number]

export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Backlog', tone: 'coral' },
  { id: 'in_progress', title: 'Doing', tone: 'gold' },
  { id: 'review', title: 'Review', tone: 'mint' },
  { id: 'done', title: 'Done', tone: 'sky' },
] as const

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]['id']

export type TodoStatus = KanbanColumnId

export type Todo = {
  id: string
  title: string
  status: KanbanColumnId
  tags: TodoTag[]
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
