import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderApp() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('shows the "It worked!" success message', () => {
    renderApp()

    expect(screen.getByText('It worked!')).toBeInTheDocument()
  })

  it('renders the success message with the success styling class', () => {
    renderApp()

    expect(screen.getByText('It worked!')).toHaveClass('app__success')
  })

  it('still renders the Navbar and Footer', () => {
    renderApp()

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
