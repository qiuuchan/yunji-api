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

import { Trust } from '../components/sections/trust'

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

describe('home trust section', () => {
  test('renders the section eyebrow and the compliance assurance line', () => {
    render(<Trust />)

    expect(
      screen.getByText('Trusted by teams building with AI')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'SOC 2 ready · HTTPS everywhere · we never store your prompts'
      )
    ).toBeInTheDocument()
  })

  test('does not render placeholder partner cards', () => {
    render(<Trust />)

    expect(screen.queryByText('Partner')).not.toBeInTheDocument()
  })
})
