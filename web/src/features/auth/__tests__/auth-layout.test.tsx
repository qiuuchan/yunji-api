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
import { describe, expect, test, vi } from 'vitest'

import { AuthLayout } from '../auth-layout'

// TanStack Link needs a router context; a plain anchor is a faithful
// stand-in for the layout shell contract under test.
vi.mock('@tanstack/react-router', () => ({
  Link: (props: { to: string; children: React.ReactNode }) => (
    <a href={props.to}>{props.children}</a>
  ),
}))

vi.mock('@/hooks/use-system-config', () => ({
  useSystemConfig: () => ({
    systemName: 'YUNJI API',
    logo: '/brand/logo.png',
    loading: false,
    logoLoaded: true,
    footerHtml: '',
    demoSiteEnabled: false,
  }),
}))

function renderLayout() {
  return render(
    <AuthLayout>
      <div>
        <p>Form slot</p>
        <button type='button'>Submit</button>
      </div>
    </AuthLayout>
  )
}

describe('auth layout shell', () => {
  test('renders the split brand panel with slogan and facts beside the form (lg+)', () => {
    const { container } = renderLayout()

    expect(container.firstElementChild).toHaveClass('lg:grid-cols-2')

    const aside = container.querySelector('aside')
    expect(aside).not.toBeNull()
    expect(aside).toHaveTextContent('YUNJI API')
    expect(aside).toHaveTextContent('Every AI Model, One API')
    expect(aside).toHaveTextContent(
      'OpenAI-compatible endpoint for your existing SDK'
    )
    expect(aside).toHaveTextContent(
      'Per-token billing with itemized usage logs'
    )
    expect(aside).toHaveTextContent('Open-source core, auditable under AGPL')

    const main = container.querySelector('main')
    expect(main).toHaveTextContent('Form slot')
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  test('keeps the brand panel out of the mobile single-column flow', () => {
    const { container } = renderLayout()

    const aside = container.querySelector('aside')
    expect(aside).toHaveClass('hidden')
    expect(aside).toHaveClass('lg:flex')

    const mobileBrandRow = container.querySelector('main div')
    expect(mobileBrandRow).not.toBeNull()
  })

  test('renders the form flat, without the legacy glass card wrapper', () => {
    const { container } = renderLayout()

    expect(container.innerHTML).not.toMatch(/brand-card/)
    expect(container.innerHTML).not.toMatch(/backdrop-filter/)
  })
})
