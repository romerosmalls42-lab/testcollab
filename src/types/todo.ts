export const TODO_TAGS = [
  'Discovery',
  'Design',
  'Engineering',
  'Growth',
  'Bug',
] as const

export type TodoTag = (typeof TODO_TAGS)[number]

export const DEPARTMENTS = [
  { id: 'engineering', name: 'Engineering', initial: 'E' },
  { id: 'design', name: 'Design', initial: 'D' },
  { id: 'marketing', name: 'Marketing', initial: 'M' },
  { id: 'sales', name: 'Sales', initial: 'S' },
  { id: 'operations', name: 'Operations', initial: 'O' },
] as const

export type DepartmentId = (typeof DEPARTMENTS)[number]['id']

/** @deprecated Use DepartmentId — kept as alias during migration of board copy. */
export type AgentId = DepartmentId

/** @deprecated Use DEPARTMENTS */
export const AGENTS = DEPARTMENTS

export const DEPARTMENT_ACCENTS: Record<DepartmentId, string> = {
  engineering: '#e0a45a',
  design: '#d4a0c7',
  marketing: '#7eb8a2',
  sales: '#6ea8d9',
  operations: '#c4b06a',
}

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
  departmentId: DepartmentId
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

/** Map a board tag to the owning department. */
export function departmentForTag(tag: TodoTag): DepartmentId {
  switch (tag) {
    case 'Engineering':
    case 'Bug':
      return 'engineering'
    case 'Design':
      return 'design'
    case 'Growth':
      return 'marketing'
    case 'Discovery':
      return 'operations'
  }
}

export function departmentForTodo(todo: Pick<Todo, 'tags' | 'departmentId'>): DepartmentId {
  const primary = todo.tags[0]
  if (primary) return departmentForTag(primary)
  return todo.departmentId
}

export function getDepartment(departmentId: DepartmentId) {
  return DEPARTMENTS.find((dept) => dept.id === departmentId) ?? DEPARTMENTS[0]
}

/** @deprecated Use getDepartment */
export function getAgent(agentId: AgentId) {
  return getDepartment(agentId)
}

/** @deprecated Prefer departmentForTag for auto-assign */
export function agentFor(id: string): (typeof DEPARTMENTS)[number] {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 3)) % DEPARTMENTS.length
  }
  return DEPARTMENTS[hash]
}
