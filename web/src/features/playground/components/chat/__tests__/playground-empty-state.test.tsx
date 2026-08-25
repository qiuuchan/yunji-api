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
import {
  Router,
  RouterContextProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import { beforeAll, describe, expect, test, vi } from 'vitest'

import { PlaygroundEmptyState } from '../playground-empty-state'

beforeAll(() => {
  i18next.addResourceBundle('en', 'translation', {
    'Start a playground chat': 'Start a playground chat',
    'Test a model with a starter prompt, or write your own request below.':
      'Test a model with a starter prompt, or write your own request below.',
    'Start chatting after you sign in':
      'Sign in to use your own quota and start a conversation',
    'Sign in': 'Sign in',
    Analyze: 'Analyze data',
    'Summarize text': 'Summarize text',
    Code: 'Code',
    'Get advice': 'Get advice',
  })
})

const rootRoute = createRootRoute()
const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => null,
})
const router = createRoute({
  getParentRoute: () => testRoute,
  path: '/sign-in',
  component: () => null,
})

const routeTree = rootRoute.addChildren([testRoute, router])

function renderWithRouter(element: React.ReactNode) {
  const memoryHistory = createMemoryHistory({ initialEntries: ['/playground'] })
  const testRouter = new Router({
    routeTree,
    history: memoryHistory,
  })
  return render(
    <RouterContextProvider router={testRouter}>{element}</RouterContextProvider>
  )
}

describe('PlaygroundEmptyState visitor guide banner', () => {
  test('shows the sign-in guide banner for anonymous visitors', () => {
    renderWithRouter(
      <PlaygroundEmptyState onSelectPrompt={() => undefined} isAnonymous />
    )

    expect(
      screen.getByText('Sign in to use your own quota and start a conversation')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  test('does not show the guide banner for authenticated users', () => {
    renderWithRouter(
      <PlaygroundEmptyState
        onSelectPrompt={() => undefined}
        isAnonymous={false}
      />
    )

    expect(
      screen.queryByText(
        'Sign in to use your own quota and start a conversation'
      )
    ).not.toBeInTheDocument()
  })

  test('anonymous visitor sees a sign-in button in the guide banner', () => {
    renderWithRouter(
      <PlaygroundEmptyState onSelectPrompt={() => undefined} isAnonymous />
    )

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  test('authenticated visitor does not see a sign-in button', () => {
    renderWithRouter(
      <PlaygroundEmptyState
        onSelectPrompt={() => undefined}
        isAnonymous={false}
      />
    )

    expect(
      screen.queryByRole('button', { name: 'Sign in' })
    ).not.toBeInTheDocument()
  })

  test('starter prompt is still selectable for anonymous visitors', async () => {
    const onSelectPrompt = vi.fn()
    renderWithRouter(
      <PlaygroundEmptyState onSelectPrompt={onSelectPrompt} isAnonymous />
    )

    await userEvent.click(screen.getByText('Analyze data'))

    expect(onSelectPrompt).toHaveBeenCalledWith('Analyze data')
  })
})
