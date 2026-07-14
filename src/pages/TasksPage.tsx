import { useState, type DragEvent, type FormEvent } from 'react'
import type { Todo, TodoStatus } from '../types/todo'
import type { TodoFilter } from '../components/Navbar'
import './TasksPage.css'

const SEED_TODOS: Todo[] = [
  { id: 'seed-luna', title: 'Draft the brief for Luna', status: 'completed' },
  { id: 'seed-ship', title: 'Ship the landing polish', status: 'active' },
  { id: 'seed-harper', title: 'Reply to Harper', status: 'active' },
  { id: 'seed-review', title: 'Review tomorrow morning', status: 'active' },
]

const TODO_MIME = 'application/x-todo-id'

type TasksPageProps = {
  filter?: TodoFilter
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `todo-${crypto.randomUUID()}`
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function TasksPage({ filter = 'all' }: TasksPageProps) {
  const [todos, setTodos] = useState<Todo[]>(SEED_TODOS)
  const [draft, setDraft] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<TodoStatus | null>(null)

  const activeTodos = todos.filter((todo) => todo.status === 'active')
  const completedTodos = todos.filter((todo) => todo.status === 'completed')

  const showActive = filter === 'all' || filter === 'active'
  const showCompleted = filter === 'all' || filter === 'completed'

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    setTodos((current) => [{ id: createId(), title, status: 'active' }, ...current])
    setDraft('')
  }

  function moveTodo(id: string, status: TodoStatus) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, status } : todo)),
    )
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status: todo.status === 'active' ? 'completed' : 'active',
            }
          : todo,
      ),
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

  function handleDragOver(event: DragEvent<HTMLElement>, status: TodoStatus) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTarget(status)
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: TodoStatus) {
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
        <h1 className="tasks__title">Your list</h1>
        <p className="tasks__hint">Add a task, then drag it between To do and Done.</p>
      </header>

      <form className="tasks__composer" onSubmit={addTodo}>
        <label className="tasks__label" htmlFor="new-task">
          New task
        </label>
        <div className="tasks__composer-row">
          <input
            id="new-task"
            className="tasks__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What needs doing?"
            autoComplete="off"
          />
          <button className="tasks__add" type="submit">
            Add
          </button>
        </div>
      </form>

      <div className={filter === 'all' ? 'tasks__board' : 'tasks__board tasks__board--single'}>
        {showActive && (
          <TodoSection
            title="To do"
            status="active"
            todos={activeTodos}
            empty="Nothing here yet. Add a task above."
            draggingId={draggingId}
            isDropTarget={dropTarget === 'active'}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
        {showCompleted && (
          <TodoSection
            title="Done"
            status="completed"
            todos={completedTodos}
            empty="Finished tasks land here."
            draggingId={draggingId}
            isDropTarget={dropTarget === 'completed'}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
      </div>
    </div>
  )
}

type TodoSectionProps = {
  title: string
  status: TodoStatus
  todos: Todo[]
  empty: string
  draggingId: string | null
  isDropTarget: boolean
  onDragStart: (event: DragEvent<HTMLLIElement>, id: string) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLElement>, status: TodoStatus) => void
  onDrop: (event: DragEvent<HTMLElement>, status: TodoStatus) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function TodoSection({
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
  onToggle,
  onDelete,
}: TodoSectionProps) {
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
              <label className="tasks__task">
                <input
                  type="checkbox"
                  checked={todo.status === 'completed'}
                  onChange={() => onToggle(todo.id)}
                  aria-label={todo.title}
                />
                <span
                  className={
                    todo.status === 'completed'
                      ? 'tasks__task-title tasks__task-title--done'
                      : 'tasks__task-title'
                  }
                >
                  {todo.title}
                </span>
              </label>
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
