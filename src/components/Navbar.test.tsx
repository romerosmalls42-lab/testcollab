import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('renders a navigation landmark with the app brand', () => {
    render(<Navbar activeFilter="all" onFilterChange={() => {}} />)

    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /to-?do/i })).toHaveTextContent(/to-?do/i)
  })

  it('renders All, Active, and Completed filter links', () => {
    render(<Navbar activeFilter="all" onFilterChange={() => {}} />)

    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^active$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^completed$/i })).toBeInTheDocument()
  })

  it('marks the active filter as pressed', () => {
    render(<Navbar activeFilter="active" onFilterChange={() => {}} />)

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

    render(<Navbar activeFilter="all" onFilterChange={onFilterChange} />)

    await user.click(screen.getByRole('button', { name: /^completed$/i }))

    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith('completed')
  })
})
