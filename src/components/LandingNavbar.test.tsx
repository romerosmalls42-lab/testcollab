import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingNavbar } from './LandingNavbar'

describe('LandingNavbar', () => {
  it('renders landing navigation with To-Do, Add Team Members, and Dashboard', () => {
    render(
      <MemoryRouter>
        <LandingNavbar />
      </MemoryRouter>,
    )

    const nav = screen.getByRole('navigation', { name: /landing/i })
    expect(within(nav).getByRole('link', { name: /^to-do$/i })).toHaveAttribute(
      'href',
      '/tasks',
    )
    expect(within(nav).getByRole('link', { name: /^add team members$/i })).toHaveAttribute(
      'href',
      '/team',
    )
    expect(within(nav).getByRole('link', { name: /^dashboard$/i })).toHaveAttribute(
      'href',
      '/dashboard',
    )
  })

  it('includes a brand link back to the landing page', () => {
    render(
      <MemoryRouter>
        <LandingNavbar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /to-do home/i })).toHaveAttribute('href', '/')
  })
})
