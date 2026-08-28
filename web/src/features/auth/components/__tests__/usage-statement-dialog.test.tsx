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
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { getUserAgreement } from '@/features/legal/api'

import { UsageStatementDialog } from '../usage-statement-dialog'

vi.mock('@/features/legal/api', () => ({
  getUserAgreement: vi.fn(),
}))

const mockedGetUserAgreement = vi.mocked(getUserAgreement)

const CONFIGURED_STATEMENT = 'No abuse. Keep your keys safe.'

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const onAgree = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <QueryClientProvider client={queryClient}>
      <UsageStatementDialog
        open
        onOpenChange={onOpenChange}
        onAgree={onAgree}
      />
    </QueryClientProvider>
  )
  return { onAgree, onOpenChange }
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('UsageStatementDialog', () => {
  test('renders the configured agreement content and confirms on agree', async () => {
    const user = userEvent.setup()
    mockedGetUserAgreement.mockResolvedValue({
      success: true,
      message: '',
      data: CONFIGURED_STATEMENT,
    })
    const { onAgree } = renderDialog()

    expect(await screen.findByText(CONFIGURED_STATEMENT)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Agree and sign in' }))
    expect(onAgree).toHaveBeenCalledTimes(1)
  })

  test('reports closure without confirming when the user disagrees', async () => {
    const user = userEvent.setup()
    mockedGetUserAgreement.mockResolvedValue({
      success: true,
      message: '',
      data: '',
    })
    const { onAgree, onOpenChange } = renderDialog()

    await screen.findByText(/AI API relay service/)

    await user.click(screen.getByRole('button', { name: 'Disagree' }))
    expect(
      onOpenChange.mock.calls.find((call) => call[0] === false)
    ).toBeDefined()
    expect(onAgree).not.toHaveBeenCalled()
  })

  test('falls back to the built-in statement when none is configured', async () => {
    mockedGetUserAgreement.mockResolvedValue({
      success: true,
      message: '',
      data: '',
    })
    renderDialog()

    expect(await screen.findByText(/AI API relay service/)).toBeInTheDocument()
    expect(
      screen.getByText(/billed based on actual consumption/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Data generated or submitted while using this service/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/final right to interpret this statement/)
    ).toBeInTheDocument()
  })

  test('links to the external document when the agreement is a URL', async () => {
    mockedGetUserAgreement.mockResolvedValue({
      success: true,
      message: '',
      data: 'https://example.com/terms',
    })
    renderDialog()

    const link = await screen.findByRole('link', { name: 'View document' })
    expect(link).toHaveAttribute('href', 'https://example.com/terms')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
