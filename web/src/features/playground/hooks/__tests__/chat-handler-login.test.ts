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
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth-store'

import type { Message, PlaygroundConfig, ParameterEnabled } from '../../types'
import { useChatHandler } from '../use-chat-handler'

vi.mock('../use-stream-request', () => ({
  useStreamRequest: () => ({
    sendStreamRequest: vi.fn(),
    stopStream: vi.fn(),
    isStreaming: false,
  }),
}))

const config: PlaygroundConfig = {
  model: 'gpt-4o',
  group: 'default',
  temperature: 0.7,
  top_p: 1,
  max_tokens: 4096,
  frequency_penalty: 0,
  presence_penalty: 0,
  seed: null,
  stream: true,
}

const parameterEnabled: ParameterEnabled = {
  temperature: true,
  top_p: true,
  max_tokens: false,
  frequency_penalty: true,
  presence_penalty: true,
  seed: false,
}

const messages: Message[] = [
  { key: 'm1', from: 'user', versions: [{ id: 'v1', content: 'hi' }] },
]

function setAuthUser(present: boolean) {
  if (present) {
    useAuthStore.getState().auth.setUser({
      id: 1,
      username: 'tester',
      role: 1,
    })
  } else {
    useAuthStore.getState().auth.setUser(null)
  }
}

describe('useChatHandler anonymous send interception', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAuthUser(false)
  })

  test('anonymous send triggers requireLogin and does not dispatch a request', () => {
    const requireLogin = vi.fn()
    const onMessageUpdate = vi.fn()
    const { result } = renderHook(() =>
      useChatHandler({
        config,
        parameterEnabled,
        onMessageUpdate,
        requireLogin,
      })
    )

    act(() => {
      result.current.sendChat(messages)
    })

    expect(requireLogin).toHaveBeenCalledTimes(1)
    expect(onMessageUpdate).not.toHaveBeenCalled()
  })

  test('authenticated send proceeds without requiring login', () => {
    setAuthUser(true)
    const requireLogin = vi.fn()
    const onMessageUpdate = vi.fn()
    const { result } = renderHook(() =>
      useChatHandler({
        config,
        parameterEnabled,
        onMessageUpdate,
        requireLogin,
      })
    )

    act(() => {
      result.current.sendChat(messages)
    })

    expect(requireLogin).not.toHaveBeenCalled()
  })
})
