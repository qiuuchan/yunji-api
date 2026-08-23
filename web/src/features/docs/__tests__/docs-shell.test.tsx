/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { DocsShell } from '../components/docs-shell'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/**
 * jsdom does not implement IntersectionObserver; the component uses it for
 * active-section tracking on scroll. Replace with a no-op so the effect can
 * mount without throwing.
 */
function mockIntersectionObserver() {
  class MockObserver {
    observe() {}
    disconnect() {}
    takeRecords() {}
    unobserve() {}
  }
  // @ts-expect-error assign mock
  globalThis.IntersectionObserver = MockObserver
}

describe('DocsShell', () => {
  test('mobile TOC toggle opens and closes the drawer', () => {
    mockIntersectionObserver()
    render(<DocsShell />)

    const toggle = screen.getByTestId('docs-toc-toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const dialog = document.getElementById('docs-toc-drawer')
    expect(dialog).not.toBeNull()

    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('selecting a TOC link highlights it as active and scrolls its section into view', () => {
    mockIntersectionObserver()
    render(<DocsShell />)

    const targetLink = screen.getAllByRole('link', {
      name: 'Authentication',
    })[0]
    expect(targetLink).toHaveAttribute('href', '#authentication')

    const section = document.getElementById('authentication')
    expect(section).not.toBeNull()
    const scrollSpy = vi.spyOn(section as HTMLElement, 'scrollIntoView')

    fireEvent.click(targetLink)

    // The clicked entry becomes the active highlight via aria-current.
    expect(targetLink).toHaveAttribute('aria-current', 'true')
    // The default first item is no longer the active highlight.
    const quickStart = screen.getAllByRole('link', { name: 'Quick start' })[0]
    expect(quickStart).not.toHaveAttribute('aria-current', 'true')
    // Selecting scrolls the matching section into view.
    expect(scrollSpy).toHaveBeenCalled()
  })
})
