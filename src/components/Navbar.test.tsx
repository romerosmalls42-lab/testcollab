import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'
import type { TagFilter } from '../types/todo'

function renderNavbar(
  props: {
    activeFilter?: TagFilter
    onFilterChange?: (filter: TagFilter) => void
  } = {},
) {
  const { activeFilter = 'all', onFilterChange = () => {} } = props
  return render(
    <MemoryRouter>
      <Navbar activeFilter={activeFilter} onFilterChange={onFilterChange} />
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  it('renders a navigation landmark with the app brand', () => {
    renderNavbar()

    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /to-?do/i })).toHaveTextContent(/to-?do/i)
  })

  it('renders All and product tag filters', () => {
    renderNavbar()

    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^discovery$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^design$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^engineering$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^growth$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^bug$/i })).toBeInTheDocument()
  })

  it('marks the active tag filter as pressed', () => {
    renderNavbar({ activeFilter: 'Design' })

    expect(screen.getByRole('button', { name: /^design$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^all$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('calls onFilterChange when a tag filter is clicked', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()

    renderNavbar({ onFilterChange })

    await user.click(screen.getByRole('button', { name: /^growth$/i }))

    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith('Growth')
  })

  it('links to the agent channel from the board navbar', () => {
    renderNavbar()

    expect(screen.getByRole('link', { name: /^channel$/i })).toHaveAttribute(
      'href',
      '/channel',
    )
  })
})
