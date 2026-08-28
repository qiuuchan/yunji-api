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
// ============================================================================
// Invoice Type Definitions
// ============================================================================

/**
 * Invoice application status
 */
export type InvoiceStatus = 'pending' | 'issued' | 'rejected'

/**
 * Invoice title type
 */
export type InvoiceTitleType = 'personal' | 'company'

/**
 * Invoice application record (admin view)
 */
export interface Invoice {
  /** Record ID */
  id: number
  /** User ID */
  user_id: number
  /** Related topup record ID */
  topup_id: number
  /** Order number snapshot */
  trade_no: string
  /** Invoiced amount snapshot (actual money paid) */
  amount: number
  /** Invoice title type */
  title_type: InvoiceTitleType
  /** Invoice title */
  title: string
  /** Tax ID */
  tax_id: string
  /** Email receiving the invoice */
  email: string
  /** Application status */
  status: InvoiceStatus
  /** Rejection reason or admin remark */
  admin_remark: string
  /** Issued invoice file link */
  invoice_url: string
  /** Creation timestamp */
  create_time: number
  /** Last update timestamp */
  update_time: number
}

/**
 * Generic API response
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

/**
 * Invoice list query parameters (admin)
 */
export interface GetInvoicesParams {
  p?: number
  page_size?: number
  /** Status filter; empty means no filter */
  status?: InvoiceStatus | ''
  /** Matches order number or title */
  keyword?: string
}

export interface GetInvoicesResponse {
  success: boolean
  message?: string
  data?: {
    items: Invoice[]
    total: number
    page: number
    page_size: number
  }
}

/**
 * Admin review action
 */
export type InvoiceReviewAction = 'issue' | 'reject'

/**
 * Admin review request payload
 */
export interface ReviewInvoiceRequest {
  id: number
  action: InvoiceReviewAction
  /** Required when rejecting */
  admin_remark: string
  /** Issued invoice file link */
  invoice_url: string
}

/**
 * Dialog types driven by the invoices provider
 */
export type InvoicesDialogType = 'issue' | 'reject'
