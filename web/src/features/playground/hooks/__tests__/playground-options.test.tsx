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
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  getPublicPlaygroundModels,
  getUserGroups,
  getUserModels,
} from '../../api'
import type { GroupOption, ModelOption } from '../../types'
import { usePlaygroundOptions } from '../use-playground-options'

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('../../api', () => ({
  getPublicPlaygroundModels: vi.fn(),
  getUserModels: vi.fn(),
  getUserGroups: vi.fn(),
}))

const mockedGetPublicPlaygroundModels = vi.mocked(getPublicPlaygroundModels)
const mockedGetUserModels = vi.mocked(getUserModels)
const mockedGetUserGroups = vi.mocked(getUserGroups)

const publicModels: ModelOption[] = [{ label: 'model-a', value: 'model-a' }]
const userModels: ModelOption[] = [{ label: 'model-b', value: 'model-b' }]
const groups: GroupOption[] = [{ label: 'default', value: 'default', ratio: 1 }]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const baseConfigActions = {
  setGroups: () => undefined,
  setModels: () => undefined,
  updateConfig: () => undefined,
}

describe('usePlaygroundOptions anonymous degradation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetPublicPlaygroundModels.mockResolvedValue(publicModels)
    mockedGetUserModels.mockResolvedValue(userModels)
    mockedGetUserGroups.mockResolvedValue(groups)
  })

  test('anonymous uses public models endpoint and disables groups query', async () => {
    const { result } = renderHook(
      () =>
        usePlaygroundOptions({
          currentGroup: 'default',
          currentModel: 'model-a',
          isAuthenticated: false,
          ...baseConfigActions,
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoadingModels).toBe(false))

    expect(mockedGetPublicPlaygroundModels).toHaveBeenCalledTimes(1)
    expect(mockedGetUserModels).not.toHaveBeenCalled()
    expect(mockedGetUserGroups).not.toHaveBeenCalled()
  })

  test('anonymous does not fire authenticated model or group requests', async () => {
    renderHook(
      () =>
        usePlaygroundOptions({
          currentGroup: 'default',
          currentModel: 'model-a',
          isAuthenticated: false,
          ...baseConfigActions,
        }),
      { wrapper: createWrapper() }
    )

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(mockedGetUserModels).not.toHaveBeenCalled()
    expect(mockedGetUserGroups).not.toHaveBeenCalled()
  })

  test('authenticated uses user models for the current group and loads groups', async () => {
    const { result } = renderHook(
      () =>
        usePlaygroundOptions({
          currentGroup: 'default',
          currentModel: 'model-b',
          isAuthenticated: true,
          ...baseConfigActions,
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoadingModels).toBe(false))

    expect(mockedGetUserModels).toHaveBeenCalledWith('default')
    expect(mockedGetPublicPlaygroundModels).not.toHaveBeenCalled()
    expect(mockedGetUserGroups).toHaveBeenCalledTimes(1)
  })
})
