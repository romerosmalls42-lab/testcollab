import { useState, type DragEvent, type FormEvent } from 'react'
import {
  KANBAN_COLUMNS,
  TODO_TAGS,
  stickyToneFor,
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
  },
  {
    id: 'seed-empty',
    title: 'Redesign empty states',
    status: 'in_progress',
    tags: ['Design'],
  },
  {
    id: 'seed-auth',
    title: 'Ship auth polish',
    status: 'review',
    tags: ['Engineering'],
  },
  {
    id: 'seed-waitlist',
    title: 'Launch waitlist email',
    status: 'done',
    tags: ['Growth'],
  },
  {
    id: 'seed-checkout',
    title: 'Fix checkout crash on retry',
    status: 'in_progress',
    tags: ['Bug', 'Engineering'],
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

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `todo-${crypto.randomUUID()}`
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function tagClass(tag: TodoTag) {
  return `tasks__tag tasks__tag--${tag.toLowerCase()}`
}

export function TasksPage({ tagFilter = 'all' }: TasksPageProps) {
  const [todos, setTodos] = useState<Todo[]>(SEED_TODOS)
  const [draft, setDraft] = useState('')
  const [draftTag, setDraftTag] = useState<TodoTag>('Discovery')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<KanbanColumnId | null>(null)

  const visibleTodos =
    tagFilter === 'all'
      ? todos
      : todos.filter((todo) => todo.tags.includes(tagFilter))

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    setTodos((current) => [
      {
        id: createId(),
        title,
        status: 'backlog',
        tags: [draftTag],
      },
      ...current,
    ])
    setDraft('')
  }

  function moveTodo(id: string, status: KanbanColumnId) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, status } : todo)),
    )
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
        <h1 className="tasks__title">Kanban Board</h1>
        <p className="tasks__hint">
          Drag sticky notes across Backlog, Doing, Review, and Done. Filter by product tag.
        </p>
      </header>

      <form className="tasks__composer" onSubmit={addTodo}>
        <div className="tasks__composer-title-block">
          <label className="tasks__field-label" htmlFor="new-task">
            Work item title
          </label>
          <input
            id="new-task"
            className="tasks__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What should the team ship next?"
            autoComplete="off"
          />
        </div>

        <fieldset className="tasks__tagging" aria-describedby="tagging-help">
          <legend className="tasks__tagging-legend">What type of work is this?</legend>
          <p className="tasks__tagging-help" id="tagging-help">
            Pick a tag that matches the kind of work. You can filter the board by these tags
            later.
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
          Add sticky note
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
              isDropTarget={dropTarget === column.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={deleteTodo}
            />
          )
        })}
      </div>
    </div>
  )
}

function emptyCopy(column: KanbanColumnId) {
  switch (column) {
    case 'backlog':
      return 'Park the next bets here.'
    case 'in_progress':
      return 'Drop a sticky note when work starts.'
    case 'review':
      return 'Ready for critique or QA.'
    case 'done':
      return 'Shipped work sticks here.'
  }
}

type KanbanColumnProps = {
  title: string
  tone: 'coral' | 'gold' | 'mint' | 'sky'
  status: KanbanColumnId
  todos: Todo[]
  empty: string
  draggingId: string | null
  isDropTarget: boolean
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
  isDropTarget,
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
        <h2 className="tasks__column-title">{title}</h2>
        <span className="tasks__count">{todos.length}</span>
      </div>

      <div className="tasks__column-body">
        {todos.length === 0 ? (
          <p className="tasks__empty">{empty}</p>
        ) : (
          <ul className="tasks__list">
            {todos.map((todo) => {
              const toneName = stickyToneFor(todo.id)
              return (
                <li
                  key={todo.id}
                  className={
                    draggingId === todo.id
                      ? `tasks__sticky tasks__sticky--${toneName} tasks__sticky--dragging`
                      : `tasks__sticky tasks__sticky--${toneName}`
                  }
                  data-todo-id={todo.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, todo.id)}
                  onDragEnd={onDragEnd}
                >
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
