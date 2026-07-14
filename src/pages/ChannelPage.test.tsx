import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ChannelPage } from './ChannelPage'

function renderChannel(initialEntry = '/channel') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ChannelPage />
    </MemoryRouter>,
  )
}

describe('ChannelPage agent group chat', () => {
  it('opens the agent channel as a group conversation', () => {
    renderChannel()

    expect(screen.getByRole('heading', { name: /agent channel/i })).toBeInTheDocument()
    expect(
      screen.getByText(/talk with your agents like a group chat/i),
    ).toBeInTheDocument()
    expect(screen.getByTestId('channel-feed')).toBeInTheDocument()
  })

  it('shows agents and you as channel members with distinct accent identities', () => {
    renderChannel()

    const members = screen.getByRole('region', { name: /members/i })
    expect(within(members).getByText(/^you$/i)).toBeInTheDocument()

    for (const name of ['scout', 'forge', 'nova', 'atlas']) {
      const row = within(members).getByTestId(`member-${name}`)
      expect(row).toHaveAttribute('data-agent', name)
      expect(row.querySelector('.channel__avatar')).toHaveAttribute('data-agent', name)
    }
  })

  it('shows live agent presence connected to board work', () => {
    renderChannel()

    const nova = screen.getByTestId('member-nova')
    expect(within(nova).getByTestId('presence-dot')).toHaveAttribute('data-status', 'working')
    expect(within(nova).getByText(/on:\s*redesign empty states/i)).toBeInTheDocument()

    const forge = screen.getByTestId('member-forge')
    expect(within(forge).getByTestId('presence-dot')).toHaveAttribute('data-status', 'working')

    const scout = screen.getByTestId('member-scout')
    expect(within(scout).getByTestId('presence-dot')).toHaveAttribute('data-status', 'idle')

    const atlas = screen.getByTestId('member-atlas')
    expect(within(atlas).getByTestId('presence-dot')).toHaveAttribute('data-status', 'away')
  })

  it('lists discussion topics with unread indicators for inactive threads', () => {
    renderChannel()

    expect(screen.getByRole('tab', { name: /general/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      within(screen.getByRole('tab', { name: /revisions/i })).getByTestId('topic-unread'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('tab', { name: /standup/i })).getByTestId('topic-unread'),
    ).toBeInTheDocument()
  })

  it('lists discussion topics and lets you switch them', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.click(screen.getByRole('tab', { name: /revisions/i }))
    expect(screen.getByRole('tab', { name: /revisions/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByTestId('active-topic')).toHaveTextContent(/revisions/i)
    expect(
      within(screen.getByRole('tab', { name: /revisions/i })).queryByTestId('topic-unread'),
    ).not.toBeInTheDocument()
  })

  it('lets you start a new topic for discussion', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.click(screen.getByRole('button', { name: /new topic/i }))
    await user.type(screen.getByLabelText(/topic name/i), 'Launch week')
    await user.click(screen.getByRole('button', { name: /create topic/i }))

    expect(screen.getByRole('tab', { name: /launch week/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /launch week/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('posts your message into the active topic with a timestamp', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.type(
      screen.getByLabelText(/message the channel/i),
      'Anyone free to pair on auth polish?',
    )
    await user.click(screen.getByRole('button', { name: /send/i }))

    const feed = screen.getByTestId('channel-feed')
    expect(within(feed).getByText(/anyone free to pair on auth polish/i)).toBeInTheDocument()
    expect(within(feed).getByText(/^you$/i)).toBeInTheDocument()
    expect(within(feed).getAllByTestId('message-time').length).toBeGreaterThan(0)
  })

  it('renders board-linked messages as embedded task preview cards', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.click(screen.getByRole('tab', { name: /revisions/i }))
    const feed = screen.getByTestId('channel-feed')
    const card = within(feed).getByTestId('board-preview')
    expect(within(card).getByText(/redesign empty states/i)).toBeInTheDocument()
    expect(within(card).getByText(/agents working/i)).toBeInTheDocument()
    expect(card).toHaveAttribute('href', '/tasks?focus=seed-empty')
  })

  it('gets an agent reply after you send a message', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderChannel()

    await user.type(screen.getByLabelText(/message the channel/i), 'Need eyes on checkout.')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await vi.advanceTimersByTimeAsync(600)

    const feed = screen.getByTestId('channel-feed')
    expect(within(feed).getByText(/forge|scout|nova|atlas/i)).toBeInTheDocument()
    expect(
      within(feed).getByText(/checkout|revision|review|harden|dig into|tracking/i),
    ).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('opens a searchable board-item modal and inserts a mention-style chip', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.click(screen.getByRole('button', { name: /link board item/i }))
    const dialog = screen.getByRole('dialog', { name: /link a board item/i })
    expect(dialog).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search board tasks/i), 'auth')
    expect(within(dialog).getByRole('option', { name: /ship auth polish/i })).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('option', { name: /redesign empty states/i }),
    ).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole('option', { name: /ship auth polish/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const chip = screen.getByTestId('composer-task-chip')
    expect(chip).toHaveTextContent(/ship auth polish/i)

    await user.type(
      screen.getByLabelText(/message the channel/i),
      'This needs another pass before we ship.',
    )
    await user.click(screen.getByRole('button', { name: /send/i }))

    const feed = screen.getByTestId('channel-feed')
    const preview = within(feed).getByTestId('board-preview')
    expect(preview).toHaveAttribute('href', '/tasks?focus=seed-auth')
    expect(within(preview).getByText(/ship auth polish/i)).toBeInTheDocument()
  })

  it('shows an active tasks panel reflecting live board work', () => {
    renderChannel()

    const panel = screen.getByRole('region', { name: /active tasks/i })
    expect(within(panel).getByText(/redesign empty states/i)).toBeInTheDocument()
    expect(within(panel).getByText(/fix checkout crash on retry/i)).toBeInTheDocument()
    expect(within(panel).getByText(/^nova$/i)).toBeInTheDocument()
    expect(within(panel).getByText(/^forge$/i)).toBeInTheDocument()
  })

  it('starts a virtual meeting with agents in the active topic', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.click(screen.getByRole('button', { name: /start meeting/i }))

    expect(screen.getByTestId('live-meeting')).toHaveTextContent(/live/i)
    expect(screen.getByRole('region', { name: /live meeting/i })).toBeInTheDocument()

    const feed = screen.getByTestId('channel-feed')
    expect(within(feed).getByText(/meeting started/i)).toBeInTheDocument()
  })

  it('ends a live meeting', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.click(screen.getByRole('button', { name: /start meeting/i }))
    await user.click(screen.getByRole('button', { name: /end meeting/i }))

    expect(screen.queryByTestId('live-meeting')).not.toBeInTheDocument()
    expect(screen.getByText(/meeting ended/i)).toBeInTheDocument()
  })
})
