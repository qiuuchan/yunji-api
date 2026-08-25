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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Router,
  RouterContextProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DirectionProvider } from '@/context/direction-provider'
import { useAuthStore } from '@/stores/auth-store'

import { Route } from '../index'

// The page component under test is the route's layout switch; the Playground
// feature itself (chat stream, API calls) is out of scope here.
vi.mock('@/features/playground', () => ({
  Playground: () => <div data-testid='playground-content' />,
}))

const rootRoute = createRootRoute()
const playgroundStubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/playground',
  component: () => null,
})
const routeTree = rootRoute.addChildren([playgroundStubRoute])

function signIn() {
  useAuthStore.setState((state) => ({
    auth: {
      ...state.auth,
      user: { id: 1, username: 'tester', role: 1 },
      accessToken: 'test-access-token',
      accessExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    },
  }))
}

function renderPlaygroundPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const memoryHistory = createMemoryHistory({ initialEntries: ['/playground'] })
  const testRouter = new Router({ routeTree, history: memoryHistory })
  const PageComponent = Route.options.component
  if (!PageComponent) throw new Error('playground route has no component')
  return render(
    <RouterContextProvider router={testRouter}>
      <QueryClientProvider client={queryClient}>
        <DirectionProvider>
          <PageComponent />
        </DirectionProvider>
      </QueryClientProvider>
    </RouterContextProvider>
  )
}

describe('playground page layout switch', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useAuthStore.getState().auth.reset()
  })

  test('anonymous visitor gets the public layout without the console sidebar', () => {
    const { container } = renderPlaygroundPage()

    expect(screen.getByTestId('playground-content')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="sidebar-inset"]')
    ).not.toBeInTheDocument()
  })

  test('signed-in user gets the console shell with the sidebar around the playground', () => {
    signIn()
    const { container } = renderPlaygroundPage()

    const inset = container.querySelector('[data-slot="sidebar-inset"]')
    expect(inset).toBeInTheDocument()
    expect(container.querySelector('[data-slot="sidebar"]')).toBeInTheDocument()
    // The playground content lives inside the console content area.
    expect(inset?.contains(screen.getByTestId('playground-content'))).toBe(true)
  })
})
