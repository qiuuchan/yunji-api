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
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DEFAULT_CONFIG, DEFAULT_PARAMETER_ENABLED } from '../../../constants'
import { loadInputDraft } from '../../../lib'
import type { GroupOption, ModelOption } from '../../../types'
import { PlaygroundInput } from '../playground-input'

const models: ModelOption[] = [{ label: 'gpt-4o', value: 'gpt-4o' }]
const groups: GroupOption[] = [{ label: 'default', value: 'default', ratio: 1 }]

function renderInput(onSubmit: (text: string) => boolean | void) {
  const props = {
    config: DEFAULT_CONFIG,
    groups,
    groupValue: 'default',
    models,
    modelValue: 'gpt-4o',
    parameterEnabled: DEFAULT_PARAMETER_ENABLED,
    onConfigChange: vi.fn(),
    onGroupChange: vi.fn(),
    onModelChange: vi.fn(),
    onParameterEnabledChange: vi.fn(),
    onSubmit,
  }
  const utils = render(<PlaygroundInput {...props} />)
  return { props, ...utils }
}

describe('PlaygroundInput submit draft handling', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('keeps the draft and the input text when onSubmit vetoes the submission', async () => {
    const onSubmit = vi.fn().mockReturnValue(false)
    const { props, rerender } = renderInput(onSubmit)
    const textarea = screen.getByPlaceholderText('Ask anything')

    await userEvent.type(textarea, 'hello anonymous')
    await userEvent.keyboard('{Enter}')

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('hello anonymous')
    )
    expect(loadInputDraft()).toBe('hello anonymous')

    // PromptInput resets the raw form element on submit, so the component
    // must still hold the text for the next render to restore it.
    rerender(<PlaygroundInput {...props} />)
    expect(textarea).toHaveValue('hello anonymous')
  })

  test('clears the draft and the input text when onSubmit returns nothing', async () => {
    const onSubmit = vi.fn()
    renderInput(onSubmit)
    const textarea = screen.getByPlaceholderText('Ask anything')

    await userEvent.type(textarea, 'hello member')
    await userEvent.keyboard('{Enter}')

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('hello member'))
    expect(loadInputDraft()).toBe('')
    expect(textarea).toHaveValue('')
  })

  test('clears the draft and the input text when onSubmit explicitly accepts', async () => {
    const onSubmit = vi.fn().mockReturnValue(true)
    renderInput(onSubmit)
    const textarea = screen.getByPlaceholderText('Ask anything')

    await userEvent.type(textarea, 'hello member')
    await userEvent.keyboard('{Enter}')

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('hello member'))
    expect(loadInputDraft()).toBe('')
    expect(textarea).toHaveValue('')
  })
})
