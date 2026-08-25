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
import { beforeEach, describe, expect, test } from 'vitest'

import { useAuthStore } from '@/stores/auth-store'

import { Route } from '../index'

function setUser(present: boolean) {
  if (present) {
    useAuthStore.getState().auth.setUser({ id: 1, username: 'tester', role: 1 })
  } else {
    useAuthStore.getState().auth.setUser(null)
  }
}

function disablePlaygroundModule() {
  window.localStorage.setItem(
    'status',
    JSON.stringify({
      SidebarModulesAdmin: JSON.stringify({ chat: { playground: false } }),
    })
  )
}

function enablePlaygroundModule() {
  window.localStorage.setItem(
    'status',
    JSON.stringify({
      SidebarModulesAdmin: JSON.stringify({ chat: { playground: true } }),
    })
  )
}

describe('playground route guard', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setUser(false)
  })

  test('anonymous visitor is allowed through (no redirect thrown)', () => {
    setUser(false)
    expect(() => Route.options.beforeLoad?.({} as never)).not.toThrow()
  })

  test('authenticated visitor with module enabled is allowed through', () => {
    setUser(true)
    enablePlaygroundModule()
    expect(() => Route.options.beforeLoad?.({} as never)).not.toThrow()
  })

  test('authenticated visitor with module disabled is redirected to dashboard', () => {
    setUser(true)
    disablePlaygroundModule()

    let thrown: unknown
    try {
      Route.options.beforeLoad?.({} as never)
    } catch (error) {
      thrown = error
    }

    expect(thrown).toBeDefined()
    const redirect = thrown as { options?: { to?: string } }
    expect(redirect.options?.to).toBe('/dashboard')
  })
})
