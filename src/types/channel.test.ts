import { describe, it, expect } from 'vitest'
import {
  CHANNEL_TOPICS,
  createBoardLink,
  createChannelMessage,
  createMeeting,
  createTopic,
  boardDeepLink,
  replyAsAgent,
} from './channel'

describe('channel types and helpers', () => {
  it('exposes default topics for group discussion', () => {
    expect(CHANNEL_TOPICS.map((t) => t.slug)).toEqual([
      'general',
      'revisions',
      'standup',
    ])
  })

  it('creates a user message in a topic', () => {
    const message = createChannelMessage({
      topicSlug: 'general',
      authorId: 'you',
      body: 'Morning sync — anything blocked?',
    })

    expect(message.id).toMatch(/^msg-/)
    expect(message.authorId).toBe('you')
    expect(message.body).toBe('Morning sync — anything blocked?')
    expect(message.topicSlug).toBe('general')
    expect(message.kind).toBe('chat')
    expect(message.createdAt).toBeTruthy()
  })

  it('creates a board link payload for discussion', () => {
    const link = createBoardLink({
      todoId: 'seed-pricing',
      title: 'Validate pricing hypothesis',
      status: 'review',
    })

    expect(link.todoId).toBe('seed-pricing')
    expect(link.title).toBe('Validate pricing hypothesis')
    expect(link.status).toBe('review')
    expect(boardDeepLink(link.todoId)).toBe('/tasks?focus=seed-pricing')
  })

  it('attaches a board link to a message that needs revision', () => {
    const link = createBoardLink({
      todoId: 'seed-empty',
      title: 'Redesign empty states',
      status: 'in_progress',
    })
    const message = createChannelMessage({
      topicSlug: 'revisions',
      authorId: 'you',
      body: 'Nova — can we tighten the empty-state copy?',
      boardLink: link,
    })

    expect(message.boardLink).toEqual(link)
    expect(message.kind).toBe('chat')
  })

  it('creates a virtual meeting announcement', () => {
    const meeting = createMeeting({
      title: 'Revision sync',
      topicSlug: 'revisions',
      participantIds: ['you', 'nova', 'forge'],
    })

    expect(meeting.id).toMatch(/^meet-/)
    expect(meeting.title).toBe('Revision sync')
    expect(meeting.status).toBe('live')
    expect(meeting.participantIds).toEqual(['you', 'nova', 'forge'])
  })

  it('creates a custom topic for new discussions', () => {
    const topic = createTopic({ name: 'Launch week', slug: 'launch-week' })

    expect(topic.slug).toBe('launch-week')
    expect(topic.name).toBe('Launch week')
  })

  it('generates an agent reply grounded in the discussion', () => {
    const reply = replyAsAgent({
      agentId: 'nova',
      topicSlug: 'revisions',
      aboutTitle: 'Redesign empty states',
    })

    expect(reply.authorId).toBe('nova')
    expect(reply.topicSlug).toBe('revisions')
    expect(reply.kind).toBe('chat')
    expect(reply.body.toLowerCase()).toMatch(/empty states|revision|review/)
  })
})
