import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders a contentinfo landmark', () => {
    render(<Footer />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('shows the app brand and copyright year', () => {
    render(<Footer />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(/to-?do/i)
    expect(footer).toHaveTextContent(String(new Date().getFullYear()))
  })

  it('renders Privacy and About links', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: /^privacy$/i })).toHaveAttribute(
      'href',
      '/privacy',
    )
    expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute(
      'href',
      '/about',
    )
  })
})
