import { describe, it, expect } from 'vitest'
import {
  createStatusChangeMessage,
  createTaskMessage,
  formatMessageTime,
  formatStatusLabel,
  nextStatusAfterCommitment,
  replyAsDepartment,
} from './channel'
import {
  DEPARTMENT_ACCENTS,
  DEPARTMENTS,
  departmentForTag,
} from './todo'

describe('department and task channel helpers', () => {
  it('exposes functional departments instead of persona names', () => {
    expect(DEPARTMENTS.map((d) => d.id)).toEqual([
      'engineering',
      'design',
      'marketing',
      'sales',
      'operations',
    ])
    expect(DEPARTMENTS.map((d) => d.name)).not.toContain('Scout')
  })

  it('maps board tags to the owning department', () => {
    expect(departmentForTag('Engineering')).toBe('engineering')
    expect(departmentForTag('Bug')).toBe('engineering')
    expect(departmentForTag('Design')).toBe('design')
    expect(departmentForTag('Growth')).toBe('marketing')
    expect(departmentForTag('Discovery')).toBe('operations')
  })

  it('gives each department a distinct accent', () => {
    expect(new Set(Object.values(DEPARTMENT_ACCENTS)).size).toBe(5)
  })

  it('formats message timestamps and status labels', () => {
    expect(formatMessageTime('2026-07-14T12:05:00.000Z')).toMatch(/\d{1,2}:\d{2}/)
    expect(formatStatusLabel('review')).toMatch(/review/i)
  })

  it('creates task-scoped chat messages', () => {
    const message = createTaskMessage({
      todoId: 'seed-auth',
      authorId: 'you',
      body: 'Can we tighten the retry path?',
    })

    expect(message.todoId).toBe('seed-auth')
    expect(message.authorId).toBe('you')
    expect(message.kind).toBe('chat')
  })

  it('replies in department voice and proposes the next board status', () => {
    const reply = replyAsDepartment({
      departmentId: 'engineering',
      todoId: 'seed-checkout',
      title: 'Fix checkout crash on retry',
    })

    expect(reply.authorId).toBe('engineering')
    expect(reply.body.toLowerCase()).toMatch(/engineering|harden|review/)
    expect(nextStatusAfterCommitment('in_progress')).toBe('review')
    expect(nextStatusAfterCommitment('backlog')).toBe('in_progress')
    expect(nextStatusAfterCommitment('review')).toBeNull()
  })

  it('creates an inline status-change timeline event', () => {
    const event = createStatusChangeMessage({
      todoId: 'seed-checkout',
      departmentId: 'engineering',
      from: 'in_progress',
      to: 'review',
    })

    expect(event.kind).toBe('status')
    expect(event.body).toMatch(/engineering moved this task/i)
    expect(event.statusChange).toEqual({ from: 'in_progress', to: 'review' })
  })
})
