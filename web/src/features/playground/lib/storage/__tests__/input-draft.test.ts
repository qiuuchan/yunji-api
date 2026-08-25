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

import { clearInputDraft, loadInputDraft, saveInputDraft } from '../storage'

describe('playground input draft persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('returns an empty string when no draft exists', () => {
    expect(loadInputDraft()).toBe('')
  })

  test('round-trips a saved draft', () => {
    saveInputDraft('hello world')
    expect(loadInputDraft()).toBe('hello world')
  })

  test('clearing an empty draft removes the stored entry', () => {
    saveInputDraft('draft')
    clearInputDraft()
    expect(loadInputDraft()).toBe('')
  })

  test('saving an empty draft does not leave a stale entry', () => {
    saveInputDraft('partial')
    saveInputDraft('')
    expect(loadInputDraft()).toBe('')
  })
})
