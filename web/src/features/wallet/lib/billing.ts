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
import type { StatusBadgeProps } from '@/components/status-badge'
import { formatTimestampToDate } from '@/lib/format'

import type { InvoiceStatus, TopupStatus } from '../types'

// ============================================================================
// Billing Utility Functions
// ============================================================================

interface StatusConfig {
  variant: StatusBadgeProps['variant']
  label: string
}

/**
 * Status badge configuration
 */
export const STATUS_CONFIG: Record<TopupStatus, StatusConfig> = {
  success: {
    variant: 'success',
    label: 'Success',
  },
  pending: {
    variant: 'warning',
    label: 'Pending',
  },
  expired: {
    variant: 'danger',
    label: 'Expired',
  },
}

/**
 * Get status badge configuration
 */
export function getStatusConfig(status: TopupStatus): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

/**
 * Payment method display names
 */
export const PAYMENT_METHOD_NAMES: Record<string, string> = {
  stripe: 'Stripe',
  alipay: 'Alipay',
  wxpay: 'WeChat Pay',
  waffo: 'Waffo',
}

/**
 * Get payment method display name
 */
export function getPaymentMethodName(
  method: string,
  t?: (key: string) => string
): string {
  const name = PAYMENT_METHOD_NAMES[method] || method
  return t ? t(name) : name
}

/**
 * Format timestamp to readable date string
 */
export function formatTimestamp(timestamp: number): string {
  return formatTimestampToDate(timestamp)
}

/**
 * Invoice status badge configuration
 * `labelKey` is an i18n key, render it with `t(config.labelKey)`.
 */
export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { variant: StatusBadgeProps['variant']; labelKey: string }
> = {
  pending: { variant: 'warning', labelKey: 'Pending Issuance' },
  issued: { variant: 'success', labelKey: 'Issued' },
  rejected: { variant: 'danger', labelKey: 'Rejected' },
}

/**
 * Get invoice status badge configuration
 */
export function getInvoiceStatusConfig(status: InvoiceStatus) {
  return INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG.pending
}

/**
 * Invoice action derived from a record's application status.
 * `apply` renders the initial "Apply for Invoice" button and
 * `resubmit` re-opens the form after a rejection.
 */
export type InvoiceAction = 'apply' | 'resubmit' | 'none'

/**
 * Decide which invoice action to offer for a topup record.
 * Invoices are only offered for successful topups of the current user.
 */
export function getInvoiceAction(args: {
  isAdminView: boolean
  topupStatus: TopupStatus
  invoice: InvoiceRecordLike | undefined
}): InvoiceAction {
  if (args.isAdminView || args.topupStatus !== 'success') {
    return 'none'
  }
  if (!args.invoice) {
    return 'apply'
  }
  if (args.invoice.status === 'rejected') {
    return 'resubmit'
  }
  return 'none'
}

type InvoiceRecordLike = { status: InvoiceStatus }
