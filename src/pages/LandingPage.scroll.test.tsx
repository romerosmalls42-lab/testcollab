import { describe, it, expect } from 'vitest'
import { activeCardFromProgress } from './LandingPage'

describe('activeCardFromProgress', () => {
  it('keeps the intro stage only for a short opening scroll', () => {
    expect(activeCardFromProgress(0)).toBe(-1)
    expect(activeCardFromProgress(0.05)).toBe(-1)
    expect(activeCardFromProgress(0.09)).toBe(0)
  })

  it('advances through board cards quickly as progress increases', () => {
    expect(activeCardFromProgress(0.28)).toBe(1)
    expect(activeCardFromProgress(0.5)).toBe(2)
    expect(activeCardFromProgress(0.72)).toBe(3)
    expect(activeCardFromProgress(1)).toBe(3)
  })
})
