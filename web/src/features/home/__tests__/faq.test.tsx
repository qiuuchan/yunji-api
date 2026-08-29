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
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, test } from 'vitest'

import { FAQ } from '../components/sections/faq'

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

describe('home FAQ section', () => {
  test('renders the six landing FAQ entries as collapsed accordion triggers', () => {
    render(<FAQ />)

    const triggers = screen.getAllByRole('button')
    expect(triggers).toHaveLength(6)
    expect(triggers[0]).toHaveTextContent('faq.howToStart.question')
    expect(triggers[5]).toHaveTextContent('faq.selfHost.question')
    for (const trigger of triggers) {
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    }
  })

  test('clicking a question expands its answer and clicking again collapses it', async () => {
    const user = userEvent.setup()
    render(<FAQ />)

    const first = screen.getAllByRole('button')[0]
    expect(screen.queryByText('faq.howToStart.answer')).not.toBeInTheDocument()

    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('faq.howToStart.answer')).toBeVisible()

    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'false')
  })
})
