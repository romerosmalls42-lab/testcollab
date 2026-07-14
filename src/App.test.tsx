import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('shows the "It worked!" success message', () => {
    render(<App />)

    expect(screen.getByText('It worked!')).toBeInTheDocument()
  })

  it('renders the success message with the success styling class', () => {
    render(<App />)

    expect(screen.getByText('It worked!')).toHaveClass('app__success')
  })

  it('still renders the Navbar and Footer', () => {
    render(<App />)

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
