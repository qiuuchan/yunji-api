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
import { api } from '@/lib/api'

import type {
  ApiResponse,
  GetInvoicesParams,
  GetInvoicesResponse,
  ReviewInvoiceRequest,
} from './types'

// ============================================================================
// Invoice API Functions (admin)
// ============================================================================

/**
 * Get all invoice applications with pagination and filters (admin only)
 */
export async function getInvoices(
  params: GetInvoicesParams = {}
): Promise<GetInvoicesResponse> {
  const { p = 1, page_size = 20, status = '', keyword = '' } = params
  const queryParams = new URLSearchParams()
  queryParams.set('p', String(p))
  queryParams.set('page_size', String(page_size))
  if (status) queryParams.set('status', status)
  if (keyword) queryParams.set('keyword', keyword)
  const res = await api.get(`/api/user/invoice?${queryParams.toString()}`)
  return res.data
}

/**
 * Review an invoice application: mark as issued or reject it (admin only)
 */
export async function reviewInvoice(
  request: ReviewInvoiceRequest
): Promise<ApiResponse> {
  const res = await api.post('/api/user/invoice/review', request)
  return res.data
}
