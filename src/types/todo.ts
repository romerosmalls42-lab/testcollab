export type TodoStatus = 'active' | 'completed'

export type Todo = {
  id: string
  title: string
  status: TodoStatus
}
