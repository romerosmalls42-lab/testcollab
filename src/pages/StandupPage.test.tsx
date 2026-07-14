import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StandupPage } from './StandupPage'

describe('StandupPage', () => {
  it('provides a cross-department standup space distinct from task chat', () => {
    render(
      <MemoryRouter>
        <StandupPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /department standup/i })).toBeInTheDocument()
    expect(screen.getByText(/not tied to a single board card/i)).toBeInTheDocument()

    const roster = screen.getByRole('region', { name: /departments/i })
    for (const name of ['Engineering', 'Design', 'Marketing', 'Sales', 'Operations']) {
      expect(within(roster).getByText(name)).toBeInTheDocument()
    }
  })

  it('posts a standup update into the shared feed', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <StandupPage />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByLabelText(/message the standup/i),
      'Design needs Marketing copy by Friday.',
    )
    await user.click(screen.getByRole('button', { name: /^send$/i }))

    expect(
      within(screen.getByTestId('standup-feed')).getByText(
        /design needs marketing copy by friday/i,
      ),
    ).toBeInTheDocument()
  })
})
