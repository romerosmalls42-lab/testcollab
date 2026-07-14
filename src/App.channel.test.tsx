import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('Agent channel route', () => {
  it('renders the agent channel at /channel', () => {
    render(
      <MemoryRouter initialEntries={['/channel']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /agent channel/i })).toBeInTheDocument()
    expect(screen.getByTestId('channel-feed')).toBeInTheDocument()
  })
})
