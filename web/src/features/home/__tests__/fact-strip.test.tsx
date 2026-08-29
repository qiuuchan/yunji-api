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
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getPublicModels } from '../api'
import { FactStrip } from '../components/sections/fact-strip'

vi.mock('../api', () => ({
  getPublicModels: vi.fn(),
  getHomePageContent: vi.fn(),
}))

const mockedGetPublicModels = vi.mocked(getPublicModels)

function renderStrip() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <FactStrip />
    </QueryClientProvider>
  )
}

describe('home fact strip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows the live model count when the public endpoint responds', async () => {
    mockedGetPublicModels.mockResolvedValue([
      'gpt-5.6',
      'claude-sonnet-5',
      'deepseek-v4-pro-ga-260813',
    ])
    renderStrip()

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
    expect(screen.getByText('live models in production')).toBeInTheDocument()
  })

  test('degrades to label-only copy when the endpoint fails (no invented numbers)', async () => {
    mockedGetPublicModels.mockRejectedValue(new Error('network down'))
    renderStrip()

    await waitFor(() => {
      expect(mockedGetPublicModels).toHaveBeenCalled()
    })
    expect(screen.getByText('live models in production')).toBeInTheDocument()
    expect(screen.queryByText('3')).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
