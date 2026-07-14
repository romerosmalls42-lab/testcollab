export const TODO_TAGS = [
  'Discovery',
  'Design',
  'Engineering',
  'Growth',
  'Bug',
] as const

export type TodoTag = (typeof TODO_TAGS)[number]

export const KANBAN_COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
] as const

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]['id']

/** @deprecated Use KanbanColumnId — kept as alias during transition */
export type TodoStatus = KanbanColumnId

export type Todo = {
  id: string
  title: string
  status: KanbanColumnId
  tags: TodoTag[]
}

export type TagFilter = 'all' | TodoTag
