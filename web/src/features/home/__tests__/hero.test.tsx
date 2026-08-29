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
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { Hero } from '../components/sections/hero'

// TanStack Link needs a router context; the hero contract under test is the
// link target, so a plain anchor is a faithful stand-in here.
vi.mock('@tanstack/react-router', () => ({
  Link: (props: { to: string; children: React.ReactNode }) => (
    <a href={props.to}>{props.children}</a>
  ),
}))

describe('home hero section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('offers a unique registration CTA plus an enterprise link when logged out', () => {
    render(<Hero isAuthenticated={false} />)

    expect(screen.getByText('Every AI Model, One API')).toBeInTheDocument()

    const registerLink = screen.getByText('Start for free').closest('a')
    expect(registerLink).toHaveAttribute('href', '/register')
    const enterpriseLink = screen.getByText('Talk to Enterprise').closest('a')
    expect(enterpriseLink).toHaveAttribute('href', '/enterprise')
    expect(screen.queryByText('Go to Dashboard')).not.toBeInTheDocument()
  })

  test('collapses to a single dashboard CTA when authenticated', () => {
    render(<Hero isAuthenticated />)

    expect(screen.getByText('Go to Dashboard').closest('a')).toHaveAttribute(
      'href',
      '/dashboard'
    )
    expect(screen.queryByText('Start for free')).not.toBeInTheDocument()
    expect(screen.queryByText('Talk to Enterprise')).not.toBeInTheDocument()
  })

  test('renders the real curl example with a production model name', () => {
    const { container } = render(<Hero isAuthenticated={false} />)

    expect(container.textContent).toContain('/v1/chat/completions')
    expect(container.textContent).toContain('gpt-5.6')
    expect(container.textContent).toContain(
      'Authorization: Bearer $YUNJI_API_KEY'
    )
  })

  test('carries no legacy gradient or glow decoration classes (regression contract)', () => {
    const { container } = render(<Hero isAuthenticated={false} />)

    expect(container.innerHTML).not.toMatch(/brand-(gradient|glow)/)
    // The warm center-fade and inverted lens may use radial-gradient; what
    // must never come back is the old blue-purple decoration palette.
    expect(container.innerHTML).not.toMatch(
      /110,\s?91,\s?255|6e5bff|9d8cff|38bdf8/i
    )
  })
})
