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
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, test } from 'vitest'

import { Statement } from '../components/sections/statement'

beforeAll(() => {
  // jsdom has no IntersectionObserver; stub this browser boundary so
  // AnimateInView can mount. i18n resources stay empty, so t() echoes keys.
  class IntersectionObserverMock {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: IntersectionObserverMock,
  })
})

describe('home statement section', () => {
  test('renders the brand name and the plain-facts statement paragraph', () => {
    render(<Statement />)

    expect(screen.getByText('YUNJI API')).toBeInTheDocument()
    const paragraph = screen.getByText('YUNJI API').closest('p')
    expect(paragraph).toHaveTextContent('runs on open-source software')
    expect(paragraph).toHaveTextContent('encrypted in transit')
    expect(paragraph).toHaveTextContent('published per-token rates')
  })

  test('does not render the removed performative trust copy', () => {
    render(<Statement />)

    expect(screen.queryByText(/SOC 2/)).not.toBeInTheDocument()
    expect(
      screen.queryByText('Trusted by teams building with AI')
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/Partner/)).not.toBeInTheDocument()
  })
})
