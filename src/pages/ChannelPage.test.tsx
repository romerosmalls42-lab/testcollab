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

  it('shows agents and you as channel members', () => {
    renderChannel()

    const members = screen.getByRole('region', { name: /members/i })
    expect(within(members).getByText(/^you$/i)).toBeInTheDocument()
    expect(within(members).getByText(/^scout$/i)).toBeInTheDocument()
    expect(within(members).getByText(/^forge$/i)).toBeInTheDocument()
    expect(within(members).getByText(/^nova$/i)).toBeInTheDocument()
    expect(within(members).getByText(/^atlas$/i)).toBeInTheDocument()
  })

  it('lists discussion topics and lets you switch them', async () => {
    const user = userEvent.setup()
    renderChannel()

    expect(screen.getByRole('tab', { name: /general/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.click(screen.getByRole('tab', { name: /revisions/i }))
    expect(screen.getByRole('tab', { name: /revisions/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByTestId('active-topic')).toHaveTextContent(/revisions/i)
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

  it('posts your message into the active topic', async () => {
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

  it('attaches a board item for discussion and links into Mission Control', async () => {
    const user = userEvent.setup()
    renderChannel()

    await user.click(screen.getByRole('button', { name: /link board item/i }))
    await user.click(
      screen.getByRole('option', { name: /ship auth polish/i }),
    )
    await user.type(
      screen.getByLabelText(/message the channel/i),
      'This needs another pass before we ship.',
    )
    await user.click(screen.getByRole('button', { name: /send/i }))

    const feed = screen.getByTestId('channel-feed')
    const boardLink = within(feed).getByRole('link', { name: /ship auth polish/i })
    expect(boardLink).toHaveAttribute('href', '/tasks?focus=seed-auth')
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
