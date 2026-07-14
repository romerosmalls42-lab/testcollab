import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom'
import { ScrollToTop } from './ScrollToTop'

describe('ScrollToTop', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls the window to the top when the route changes', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo

    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <Link to="/tasks">Go tasks</Link>
        <Routes>
          <Route path="/" element={<div>home</div>} />
          <Route path="/tasks" element={<div>tasks</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    scrollTo.mockClear()

    await user.click(screen.getByRole('link', { name: /go tasks/i }))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })
})
