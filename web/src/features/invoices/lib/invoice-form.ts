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
import { z } from 'zod'

import { ERROR_MESSAGES, INVOICE_VALIDATION } from '../constants'

// ============================================================================
// Invoice Review Form Schemas
// ============================================================================

/** Mark as issued: link and remark are both optional */
export function getIssueInvoiceSchema(t: TFunction) {
  return z.object({
    invoice_url: z
      .string()
      .trim()
      .max(
        INVOICE_VALIDATION.URL_MAX_LENGTH,
        t('Invoice link must be at most 500 characters')
      )
      .refine(
        (value) => value === '' || z.string().url().safeParse(value).success,
        { message: t('Invalid URL') }
      ),
    admin_remark: z
      .string()
      .trim()
      .max(
        INVOICE_VALIDATION.REMARK_MAX_LENGTH,
        t('Remark must be at most 500 characters')
      ),
  })
}

export type IssueInvoiceValues = z.infer<
  ReturnType<typeof getIssueInvoiceSchema>
>

export const ISSUE_INVOICE_DEFAULT_VALUES: IssueInvoiceValues = {
  invoice_url: '',
  admin_remark: '',
}

/** Reject: a reason is required */
export function getRejectInvoiceSchema(t: TFunction) {
  return z.object({
    admin_remark: z
      .string()
      .trim()
      .min(1, t(ERROR_MESSAGES.REMARK_REQUIRED))
      .max(
        INVOICE_VALIDATION.REMARK_MAX_LENGTH,
        t('Remark must be at most 500 characters')
      ),
  })
}

export type RejectInvoiceValues = z.infer<
  ReturnType<typeof getRejectInvoiceSchema>
>

export const REJECT_INVOICE_DEFAULT_VALUES: RejectInvoiceValues = {
  admin_remark: '',
}
