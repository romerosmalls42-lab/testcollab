import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from './Navbar'

function renderNavbar(
  props: { activeFilter?: 'all' | 'active' | 'completed'; onFilterChange?: () => void } = {},
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

  it('renders All, Active, and Completed filter links', () => {
    renderNavbar()

    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^active$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^completed$/i })).toBeInTheDocument()
  })

  it('marks the active filter as pressed', () => {
    renderNavbar({ activeFilter: 'active' })

    expect(screen.getByRole('button', { name: /^active$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^all$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: /^completed$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('calls onFilterChange when a filter is clicked', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()

    renderNavbar({ onFilterChange })

    await user.click(screen.getByRole('button', { name: /^completed$/i }))

    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith('completed')
  })
})
