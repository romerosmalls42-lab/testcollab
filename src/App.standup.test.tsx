import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('Standup route', () => {
  it('renders department standup at /standup', () => {
    render(
      <MemoryRouter initialEntries={['/standup']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /department standup/i })).toBeInTheDocument()
  })

  it('no longer exposes the standalone /channel destination', () => {
    render(
      <MemoryRouter initialEntries={['/channel']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('heading', { name: /agent channel/i })).not.toBeInTheDocument()
  })
})
