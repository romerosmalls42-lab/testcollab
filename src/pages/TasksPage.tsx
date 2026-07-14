import { useEffect, useState, type DragEvent, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AGENTS,
  KANBAN_COLUMNS,
  TODO_TAGS,
  agentFor,
  getAgent,
  type AgentId,
  type KanbanColumnId,
  type TagFilter,
  type Todo,
  type TodoTag,
} from '../types/todo'
import './TasksPage.css'

const SEED_TODOS: Todo[] = [
  {
    id: 'seed-pricing',
    title: 'Validate pricing hypothesis',
    status: 'backlog',
    tags: ['Discovery'],
    agentId: 'scout',
  },
  {
    id: 'seed-empty',
    title: 'Redesign empty states',
    status: 'in_progress',
    tags: ['Design'],
    agentId: 'nova',
  },
  {
    id: 'seed-auth',
    title: 'Ship auth polish',
    status: 'review',
    tags: ['Engineering'],
    agentId: 'forge',
  },
  {
    id: 'seed-waitlist',
    title: 'Launch waitlist email',
    status: 'done',
    tags: ['Growth'],
    agentId: 'atlas',
  },
  {
    id: 'seed-checkout',
    title: 'Fix checkout crash on retry',
    status: 'in_progress',
    tags: ['Bug', 'Engineering'],
    agentId: 'forge',
  },
]

const TAG_GUIDANCE: Record<TodoTag, string> = {
  Discovery: 'Research & validation',
  Design: 'UI & experience',
  Engineering: 'Build & ship',
  Growth: 'Acquisition & retention',
  Bug: 'Fix something broken',
}

const TODO_MIME = 'application/x-todo-id'

type TasksPageProps = {
  tagFilter?: TagFilter
}

type AgentChoice = AgentId | 'auto'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `todo-${crypto.randomUUID()}`
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function tagClass(tag: TodoTag) {
  return `tasks__tag tasks__tag--${tag.toLowerCase()}`
}

function statusCardClass(status: KanbanColumnId) {
  switch (status) {
    case 'backlog':
      return 'tasks__sticky tasks__sticky--queued'
    case 'in_progress':
      return 'tasks__sticky tasks__sticky--working'
    case 'review':
      return 'tasks__sticky tasks__sticky--review'
    case 'done':
      return 'tasks__sticky tasks__sticky--shipped'
  }
}

export function TasksPage({ tagFilter = 'all' }: TasksPageProps) {
  const reduceMotion = useReducedMotion()
  const [todos, setTodos] = useState<Todo[]>(SEED_TODOS)
  const [draft, setDraft] = useState('')
  const [draftTag, setDraftTag] = useState<TodoTag>('Discovery')
  const [draftAgent, setDraftAgent] = useState<AgentChoice>('auto')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<KanbanColumnId | null>(null)
  const [arrivingId, setArrivingId] = useState<string | null>(null)
  const [partyTitle, setPartyTitle] = useState<string | null>(null)

  const visibleTodos =
    tagFilter === 'all'
      ? todos
      : todos.filter((todo) => todo.tags.includes(tagFilter))

  const workingTodos = visibleTodos.filter((todo) => todo.status === 'in_progress')
  const activeAgentCount = new Set(workingTodos.map((todo) => todo.agentId)).size

  useEffect(() => {
    if (!arrivingId) return
    const timer = window.setTimeout(() => setArrivingId(null), 700)
    return () => window.clearTimeout(timer)
  }, [arrivingId])

  useEffect(() => {
    if (!partyTitle) return
    const timer = window.setTimeout(() => setPartyTitle(null), 2200)
    return () => window.clearTimeout(timer)
  }, [partyTitle])

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    const id = createId()
    const agentId = draftAgent === 'auto' ? agentFor(id).id : draftAgent

    setTodos((current) => [
      {
        id,
        title,
        status: 'backlog',
        tags: [draftTag],
        agentId,
      },
      ...current,
    ])
    setDraft('')
  }

  function moveTodo(id: string, status: KanbanColumnId) {
    const current = todos.find((todo) => todo.id === id)
    if (!current || current.status === status) {
      setArrivingId(id)
      return
    }

    setTodos((items) =>
      items.map((todo) => (todo.id === id ? { ...todo, status } : todo)),
    )
    setArrivingId(id)

    if (status === 'done') {
      setPartyTitle(current.title)
    }
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function handleDragStart(event: DragEvent<HTMLLIElement>, id: string) {
    event.dataTransfer.setData(TODO_MIME, id)
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDropTarget(null)
  }

  function handleDragOver(event: DragEvent<HTMLElement>, status: KanbanColumnId) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTarget(status)
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: KanbanColumnId) {
    event.preventDefault()
    const id =
      event.dataTransfer.getData(TODO_MIME) || event.dataTransfer.getData('text/plain')
    if (id) moveTodo(id, status)
    setDraggingId(null)
    setDropTarget(null)
  }

  return (
    <div className="tasks">
      <header className="tasks__header">
        <h1 className="tasks__title">Mission Control</h1>
        <p className="tasks__hint">
          Agents claim and move work as they execute. You brief them, review output, and
          approve what ships.
        </p>
      </header>

      <form className="tasks__composer" onSubmit={addTodo}>
        <p className="tasks__composer-kicker">Brief an agent</p>
        <div className="tasks__composer-title-block">
          <label className="tasks__field-label" htmlFor="new-task">
            What should an agent do?
          </label>
          <input
            id="new-task"
            className="tasks__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Describe the outcome you want an agent to deliver"
            autoComplete="off"
          />
        </div>

        <fieldset className="tasks__agent-assign">
          <legend className="tasks__field-label">Assign to agent</legend>
          <div className="tasks__agent-options" role="group" aria-label="Assign to agent">
            <button
              type="button"
              className={
                draftAgent === 'auto'
                  ? 'tasks__agent-option tasks__agent-option--selected'
                  : 'tasks__agent-option'
              }
              aria-pressed={draftAgent === 'auto'}
              onClick={() => setDraftAgent('auto')}
            >
              Auto-assign
            </button>
            {AGENTS.map((agent) => {
              const selected = draftAgent === agent.id
              return (
                <button
                  key={agent.id}
                  type="button"
                  className={
                    selected
                      ? 'tasks__agent-option tasks__agent-option--selected'
                      : 'tasks__agent-option'
                  }
                  aria-pressed={selected}
                  aria-label={`Assign to ${agent.name}`}
                  onClick={() => setDraftAgent(agent.id)}
                >
                  <span className="tasks__agent-option-avatar" aria-hidden="true">
                    {agent.initial}
                  </span>
                  {agent.name}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="tasks__tagging" aria-describedby="tagging-help">
          <legend className="tasks__tagging-legend">What type of work is this?</legend>
          <p className="tasks__tagging-help" id="tagging-help">
            Tag the brief so you can filter the board later. Agents still own execution.
          </p>
          <div className="tasks__tag-options">
            {TODO_TAGS.map((tag) => {
              const selected = draftTag === tag
              return (
                <button
                  key={tag}
                  type="button"
                  className={
                    selected
                      ? `tasks__tag-option tasks__tag-option--${tag.toLowerCase()} tasks__tag-option--selected`
                      : `tasks__tag-option tasks__tag-option--${tag.toLowerCase()}`
                  }
                  aria-pressed={selected}
                  aria-label={`Tag as ${tag}`}
                  onClick={() => setDraftTag(tag)}
                >
                  <span className="tasks__tag-option-name">{tag}</span>
                  <span className="tasks__tag-option-desc">{TAG_GUIDANCE[tag]}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <button className="tasks__add" type="submit">
          Dispatch to Agent
        </button>
      </form>

      <div className="tasks__board tasks__board--kanban" data-testid="kanban-board">
        {KANBAN_COLUMNS.map((column) => {
          const columnTodos = visibleTodos.filter((todo) => todo.status === column.id)
          return (
            <KanbanColumn
              key={column.id}
              title={column.title}
              tone={column.tone}
              status={column.id}
              todos={columnTodos}
              empty={emptyCopy(column.id)}
              draggingId={draggingId}
              arrivingId={arrivingId}
              isDropTarget={dropTarget === column.id}
              activeAgentCount={column.id === 'in_progress' ? activeAgentCount : undefined}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={deleteTodo}
            />
          )
        })}
      </div>

      <AnimatePresence>
        {partyTitle && (
          <DoneParty key={partyTitle} title={partyTitle} reduceMotion={Boolean(reduceMotion)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function emptyCopy(column: KanbanColumnId) {
  switch (column) {
    case 'backlog':
      return 'Briefs waiting for an agent to pick up.'
    case 'in_progress':
      return 'No agents actively executing right now.'
    case 'review':
      return 'Nothing awaiting your approval.'
    case 'done':
      return 'Shipped agent work lands here.'
  }
}

type KanbanColumnProps = {
  title: string
  tone: 'coral' | 'gold' | 'mint' | 'sky'
  status: KanbanColumnId
  todos: Todo[]
  empty: string
  draggingId: string | null
  arrivingId: string | null
  isDropTarget: boolean
  activeAgentCount?: number
  onDragStart: (event: DragEvent<HTMLLIElement>, id: string) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLElement>, status: KanbanColumnId) => void
  onDrop: (event: DragEvent<HTMLElement>, status: KanbanColumnId) => void
  onDelete: (id: string) => void
}

function KanbanColumn({
  title,
  tone,
  status,
  todos,
  empty,
  draggingId,
  arrivingId,
  isDropTarget,
  activeAgentCount,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDelete,
}: KanbanColumnProps) {
  return (
    <section
      className={
        isDropTarget
          ? `tasks__column tasks__column--${tone} tasks__column--target`
          : `tasks__column tasks__column--${tone}`
      }
      aria-label={title}
      onDragOver={(event) => onDragOver(event, status)}
      onDrop={(event) => onDrop(event, status)}
    >
      <div className="tasks__column-head">
        <div className="tasks__column-head-copy">
          <h2 className="tasks__column-title">{title}</h2>
          {typeof activeAgentCount === 'number' && (
            <p className="tasks__live-agents" data-testid="active-agent-count">
              {activeAgentCount} agent{activeAgentCount === 1 ? '' : 's'} live
            </p>
          )}
        </div>
        <span className="tasks__count">{todos.length}</span>
      </div>

      <div className="tasks__column-body">
        {todos.length === 0 ? (
          <p className="tasks__empty">{empty}</p>
        ) : (
          <ul className="tasks__list">
            {todos.map((todo) => {
              const agent = getAgent(todo.agentId)
              const classes = [
                statusCardClass(todo.status),
                draggingId === todo.id ? 'tasks__sticky--dragging' : '',
                arrivingId === todo.id ? 'tasks__sticky--arriving' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <li
                  key={todo.id}
                  className={classes}
                  data-todo-id={todo.id}
                  data-agent={agent.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, todo.id)}
                  onDragEnd={onDragEnd}
                >
                  {todo.status === 'in_progress' && (
                    <span className="tasks__scan" aria-hidden="true" />
                  )}
                  <div className="tasks__card-top">
                    <span
                      className={`tasks__agent-badge tasks__agent-badge--${agent.id}`}
                      title={agent.name}
                    >
                      <span className="tasks__agent-initial" aria-hidden="true">
                        {agent.initial}
                      </span>
                      <span className="tasks__agent-name">{agent.name}</span>
                    </span>
                    {todo.status === 'in_progress' && (
                      <span className="tasks__progress" aria-hidden="true">
                        <span className="tasks__progress-dot" />
                        Executing
                      </span>
                    )}
                    {todo.status === 'review' && (
                      <span className="tasks__approval-badge">Awaiting your approval</span>
                    )}
                    {todo.status === 'done' && (
                      <span className="tasks__shipped-badge" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="tasks__task-title">{todo.title}</p>
                  <ul className="tasks__tags">
                    {todo.tags.map((tag) => (
                      <li key={tag} className={tagClass(tag)}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="tasks__delete"
                    aria-label={`Delete ${todo.title}`}
                    onClick={() => onDelete(todo.id)}
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

type DonePartyProps = {
  title: string
  reduceMotion: boolean
}

function DoneParty({ title, reduceMotion }: DonePartyProps) {
  const pieces = Array.from({ length: 18 }, (_, index) => index)

  return (
    <motion.div
      className="tasks__party"
      data-testid="done-party"
      role="status"
      aria-live="polite"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="tasks__party-message">Agent shipped: {title}</p>
      {!reduceMotion &&
        pieces.map((piece) => (
          <span
            key={piece}
            className={`tasks__party-piece tasks__party-piece--${piece % 3}`}
            style={{
              left: `${8 + ((piece * 5) % 84)}%`,
              animationDelay: `${piece * 0.035}s`,
            }}
          />
        ))}
    </motion.div>
  )
}
