import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

function createMockIntersectionObserver(
  callback: IntersectionObserverCallback,
): IntersectionObserver {
  const observer: IntersectionObserver = {
    root: null,
    rootMargin: '',
    scrollMargin: '',
    thresholds: [],
    observe(target: Element) {
      callback(
        [
          {
            isIntersecting: true,
            target,
            intersectionRatio: 1,
            time: 0,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
          },
        ],
        observer,
      )
    },
    unobserve() {},
    disconnect() {},
    takeRecords() {
      return []
    },
  }

  return observer
}

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(function IntersectionObserver(
    this: unknown,
    callback: IntersectionObserverCallback,
  ) {
    return createMockIntersectionObserver(callback)
  }),
)
