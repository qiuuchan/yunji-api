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
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { login } from '@/features/auth/api'
import { useStatus } from '@/hooks/use-status'

import { UserAuthForm } from '../user-auth-form'

vi.mock('@/hooks/use-status', () => ({
  useStatus: vi.fn(),
}))
vi.mock('@/features/auth/api', () => ({
  login: vi.fn(),
  wechatLoginByCode: vi.fn(),
}))
vi.mock('@/features/auth/hooks/use-auth-redirect', () => ({
  useAuthRedirect: vi.fn(() => ({
    handleLoginSuccess: vi.fn(),
    redirectTo2FA: vi.fn(),
  })),
}))

const mockedUseStatus = vi.mocked(useStatus)
const mockedLogin = vi.mocked(login)

const rootRoute = createRootRoute()
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: () => null,
})
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: () => null,
})
const routeTree = rootRoute.addChildren([signInRoute, forgotPasswordRoute])

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const testRouter = new Router({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/sign-in'] }),
  })
  return render(
    <RouterContextProvider router={testRouter}>
      <QueryClientProvider client={queryClient}>
        <UserAuthForm />
      </QueryClientProvider>
    </RouterContextProvider>
  )
}

async function fillCredentialsAndClickSignIn(
  user: ReturnType<typeof userEvent.setup>
) {
  await user.type(
    screen.getByPlaceholderText('Enter your username or email'),
    'alice'
  )
  await user.type(screen.getByPlaceholderText('Enter password'), 'secret123')
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

beforeEach(() => {
  mockedUseStatus.mockReturnValue({
    status: {},
    loading: false,
    error: null,
  })
  mockedLogin.mockResolvedValue({
    success: false,
    message: 'Invalid credentials',
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('UserAuthForm usage statement gate', () => {
  test('shows the usage statement on sign-in submit and defers the login request', async () => {
    const user = userEvent.setup()
    renderForm()

    await fillCredentialsAndClickSignIn(user)

    expect(await screen.findByText('Usage Statement')).toBeInTheDocument()
    expect(mockedLogin).not.toHaveBeenCalled()
  })

  test('sends the login request only after the user agrees to the statement', async () => {
    const user = userEvent.setup()
    renderForm()

    await fillCredentialsAndClickSignIn(user)
    await user.click(
      await screen.findByRole('button', { name: 'Agree and sign in' })
    )

    await waitFor(() => expect(mockedLogin).toHaveBeenCalledTimes(1))
    expect(mockedLogin).toHaveBeenCalledWith({
      username: 'alice',
      password: 'secret123',
      turnstile: '',
    })
    await waitFor(() =>
      expect(screen.queryByText('Usage Statement')).not.toBeInTheDocument()
    )
  })

  test('keeps the user signed out after disagreeing and asks again on the next attempt', async () => {
    const user = userEvent.setup()
    renderForm()

    await fillCredentialsAndClickSignIn(user)
    await user.click(await screen.findByRole('button', { name: 'Disagree' }))

    await waitFor(() =>
      expect(screen.queryByText('Usage Statement')).not.toBeInTheDocument()
    )
    expect(mockedLogin).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Usage Statement')).toBeInTheDocument()
    expect(mockedLogin).not.toHaveBeenCalled()
  })
})
