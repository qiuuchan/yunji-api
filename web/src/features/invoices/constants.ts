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
import type { TFunction } from 'i18next'

import type { StatusBadgeProps } from '@/components/status-badge'

// ============================================================================
// Invoice Status Configuration
// ============================================================================

export const INVOICE_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued',
  REJECTED: 'rejected',
} as const

export const INVOICE_TITLE_TYPE = {
  PERSONAL: 'personal',
  COMPANY: 'company',
} as const

// labelKey values are i18n keys; render with t(config.labelKey)
export const INVOICE_STATUSES: Record<
  string,
  Pick<StatusBadgeProps, 'variant'> & { labelKey: string; value: string }
> = {
  [INVOICE_STATUS.PENDING]: {
    labelKey: 'Pending Issuance',
    variant: 'warning',
    value: INVOICE_STATUS.PENDING,
  },
  [INVOICE_STATUS.ISSUED]: {
    labelKey: 'Issued',
    variant: 'success',
    value: INVOICE_STATUS.ISSUED,
  },
  [INVOICE_STATUS.REJECTED]: {
    labelKey: 'Rejected',
    variant: 'danger',
    value: INVOICE_STATUS.REJECTED,
  },
} as const

/** Values accepted by the route's status search param */
export const INVOICE_FILTER_VALUES = [
  INVOICE_STATUS.PENDING,
  INVOICE_STATUS.ISSUED,
  INVOICE_STATUS.REJECTED,
] as const

export function getInvoiceStatusOptions(t: TFunction) {
  return Object.values(INVOICE_STATUSES).map((config) => ({
    label: t(config.labelKey),
    value: config.value,
  }))
}

/**
 * Resolve the badge config for a status, falling back to pending.
 */
export function getInvoiceStatusConfig(status: string) {
  return INVOICE_STATUSES[status] ?? INVOICE_STATUSES[INVOICE_STATUS.PENDING]
}

// ============================================================================
// Validation Constants
// ============================================================================

export const INVOICE_VALIDATION = {
  REMARK_MAX_LENGTH: 500,
  URL_MAX_LENGTH: 500,
} as const

// ============================================================================
// Error Messages (i18n keys; use t(ERROR_MESSAGES.xxx) when displaying)
// ============================================================================

export const ERROR_MESSAGES = {
  UNEXPECTED: 'An unexpected error occurred',
  LOAD_FAILED: 'Failed to load invoices',
  SEARCH_FAILED: 'Failed to search invoices',
  REVIEW_FAILED: 'Failed to update invoice application',
  REMARK_REQUIRED: 'A reason is required when rejecting an application',
} as const

export const SUCCESS_MESSAGES = {
  ISSUED: 'Invoice marked as issued',
  REJECTED: 'Invoice application rejected',
} as const
