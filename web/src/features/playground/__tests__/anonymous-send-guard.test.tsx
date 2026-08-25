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
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { SSE } from 'sse.js'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { Playground } from '@/features/playground'
import { useAuthStore } from '@/stores/auth-store'

import {
  getPublicPlaygroundModels,
  getUserGroups,
  getUserModels,
  sendChatCompletion,
} from '../api'
import { STORAGE_KEYS } from '../constants'
import { loadInputDraft } from '../lib'

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('../api', () => ({
  getPublicPlaygroundModels: vi.fn(),
  getUserModels: vi.fn(),
  getUserGroups: vi.fn(),
  sendChatCompletion: vi.fn(),
}))

vi.mock('sse.js', () => ({
  SSE: vi.fn(),
}))

const mockedToastError = vi.mocked(toast.error)
const mockedGetPublicPlaygroundModels = vi.mocked(getPublicPlaygroundModels)
const mockedGetUserModels = vi.mocked(getUserModels)
const mockedGetUserGroups = vi.mocked(getUserGroups)
const mockedSendChatCompletion = vi.mocked(sendChatCompletion)
const mockedSSE = vi.mocked(SSE)

const modelOptions = [{ label: 'gpt-4o', value: 'gpt-4o' }]
const groupOptions = [{ label: 'default', value: 'default', ratio: 1 }]

const rootRoute = createRootRoute()
const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/playground',
  component: () => null,
})
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  component: () => null,
})
const routeTree = rootRoute.addChildren([playgroundRoute, signInRoute])

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

function signOut() {
  useAuthStore.getState().auth.reset()
}

function renderPlayground() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const memoryHistory = createMemoryHistory({ initialEntries: ['/playground'] })
  const testRouter = new Router({
    routeTree,
    history: memoryHistory,
  })
  const utils = render(
    <RouterContextProvider router={testRouter}>
      <QueryClientProvider client={queryClient}>
        <Playground />
      </QueryClientProvider>
    </RouterContextProvider>
  )
  return { testRouter, ...utils }
}

describe('Playground anonymous send guard', () => {
  beforeEach(() => {
    window.localStorage.clear()
    signOut()
    mockedGetPublicPlaygroundModels.mockResolvedValue(modelOptions)
    mockedGetUserModels.mockResolvedValue(modelOptions)
    mockedGetUserGroups.mockResolvedValue(groupOptions)
    mockedSendChatCompletion.mockResolvedValue({ choices: [] } as never)
    // A constructible stub: use-stream-request calls `new SSE(...)`.
    mockedSSE.mockImplementation(function () {
      return {
        addEventListener: vi.fn(),
        close: vi.fn(),
        stream: vi.fn(),
        readyState: 0,
      }
    } as never)
  })

  test('anonymous submit keeps the draft, appends no message, and redirects to sign-in', async () => {
    const { testRouter } = renderPlayground()
    const textarea = await screen.findByPlaceholderText('Ask anything')

    await userEvent.type(textarea, 'hello anonymous draft')
    await userEvent.keyboard('{Enter}')

    await waitFor(() =>
      expect(mockedToastError).toHaveBeenCalledWith(
        'Sign in to start a playground conversation'
      )
    )
    await waitFor(() =>
      expect(testRouter.state.location.pathname).toBe('/sign-in')
    )
    expect(testRouter.state.location.search).toEqual({
      redirect: window.location.href,
    })

    // No message was appended: the empty state is still rendered and nothing
    // was persisted to the messages storage key.
    expect(screen.getByText('Start a playground chat')).toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEYS.MESSAGES)).toBeNull()

    // The unsent draft survives so sign-in can return to it.
    expect(loadInputDraft()).toBe('hello anonymous draft')

    // No chat request was dispatched.
    expect(mockedSSE).not.toHaveBeenCalled()
    expect(mockedSendChatCompletion).not.toHaveBeenCalled()
  })

  test('anonymous starter prompt click guides to sign-in without appending messages', async () => {
    const { testRouter } = renderPlayground()
    const starterPrompt = await screen.findByText('Analyze data')

    await userEvent.click(starterPrompt)

    await waitFor(() =>
      expect(mockedToastError).toHaveBeenCalledWith(
        'Sign in to start a playground conversation'
      )
    )
    await waitFor(() =>
      expect(testRouter.state.location.pathname).toBe('/sign-in')
    )
    expect(screen.getByText('Start a playground chat')).toBeInTheDocument()
    expect(mockedSSE).not.toHaveBeenCalled()
    expect(mockedSendChatCompletion).not.toHaveBeenCalled()
  })

  test('restores the preserved draft into the input on the next mount', async () => {
    const first = renderPlayground()
    const textarea = await screen.findByPlaceholderText('Ask anything')

    await userEvent.type(textarea, 'hello anonymous draft')
    await userEvent.keyboard('{Enter}')

    await waitFor(() => expect(mockedToastError).toHaveBeenCalled())
    first.unmount()

    renderPlayground()
    const remountedTextarea = await screen.findByPlaceholderText('Ask anything')
    expect(remountedTextarea).toHaveValue('hello anonymous draft')
  })

  test('authenticated submit keeps the original behavior: message appended, input cleared, request dispatched', async () => {
    signIn()
    const { testRouter } = renderPlayground()
    const textarea = await screen.findByPlaceholderText('Ask anything')

    await userEvent.type(textarea, 'hello authenticated')
    await userEvent.keyboard('{Enter}')

    // The user message is appended and the streaming request is dispatched.
    expect(await screen.findByText('hello authenticated')).toBeInTheDocument()
    await waitFor(() => expect(mockedSSE).toHaveBeenCalledTimes(1))

    // The input and the stored draft are cleared as before.
    expect(textarea).toHaveValue('')
    expect(loadInputDraft()).toBe('')

    // No sign-in guide was triggered.
    expect(mockedToastError).not.toHaveBeenCalled()
    expect(testRouter.state.location.pathname).toBe('/playground')
  })
})
