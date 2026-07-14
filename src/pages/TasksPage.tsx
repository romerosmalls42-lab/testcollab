import { useState, type DragEvent, type FormEvent } from 'react'
import {
  KANBAN_COLUMNS,
  TODO_TAGS,
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
        <h1 className="tasks__title">Product board</h1>
        <p className="tasks__hint">
          Track product work across the pipeline. Drag cards between columns. Filter by tag.
        </p>
      </header>

      <form className="tasks__composer" onSubmit={addTodo}>
        <label className="tasks__label" htmlFor="new-task">
          New work item
        </label>
        <label className="tasks__label" htmlFor="new-tag">
          Tag
        </label>
        <div className="tasks__composer-row">
          <input
            id="new-task"
            className="tasks__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What should the team ship next?"
            autoComplete="off"
          />
          <select
            id="new-tag"
            className="tasks__select"
            value={draftTag}
            onChange={(event) => setDraftTag(event.target.value as TodoTag)}
            aria-label="Tag"
          >
            {TODO_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button className="tasks__add" type="submit">
            Add
          </button>
        </div>
      </form>

      <div className="tasks__board tasks__board--kanban">
        {KANBAN_COLUMNS.map((column) => {
          const columnTodos = visibleTodos.filter((todo) => todo.status === column.id)
          return (
            <KanbanColumn
              key={column.id}
              title={column.title}
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
      return 'Ideas and next bets land here.'
    case 'in_progress':
      return 'Pull a card in when work starts.'
    case 'review':
      return 'Ready for critique or QA.'
    case 'done':
      return 'Shipped work shows up here.'
  }
}

type KanbanColumnProps = {
  title: string
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
        isDropTarget ? 'tasks__section tasks__section--target' : 'tasks__section'
      }
      aria-label={title}
      onDragOver={(event) => onDragOver(event, status)}
      onDrop={(event) => onDrop(event, status)}
    >
      <div className="tasks__section-head">
        <h2 className="tasks__section-title">{title}</h2>
        <span className="tasks__count">{todos.length}</span>
      </div>

      {todos.length === 0 ? (
        <p className="tasks__empty">{empty}</p>
      ) : (
        <ul className="tasks__list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={
                draggingId === todo.id
                  ? 'tasks__item tasks__item--dragging'
                  : 'tasks__item'
              }
              data-todo-id={todo.id}
              draggable
              onDragStart={(event) => onDragStart(event, todo.id)}
              onDragEnd={onDragEnd}
            >
              <div className="tasks__card">
                <p className="tasks__task-title">{todo.title}</p>
                <ul className="tasks__tags">
                  {todo.tags.map((tag) => (
                    <li key={tag} className={tagClass(tag)}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="tasks__delete"
                aria-label={`Delete ${todo.title}`}
                onClick={() => onDelete(todo.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
