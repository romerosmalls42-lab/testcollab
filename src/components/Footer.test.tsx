import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Footer } from './Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('renders a contentinfo landmark', () => {
    renderFooter()

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('shows the app brand and copyright year', () => {
    renderFooter()

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(/to-?do/i)
    expect(footer).toHaveTextContent(String(new Date().getFullYear()))
  })

  it('renders Privacy and About links', () => {
    renderFooter()

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
