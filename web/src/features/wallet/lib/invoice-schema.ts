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
import { z } from 'zod'

// ============================================================================
// Invoice Form Schema
// ============================================================================

/** Field length limits, mirroring the backend validation */
export const INVOICE_VALIDATION = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  TAX_ID_MAX_LENGTH: 64,
  EMAIL_MAX_LENGTH: 255,
} as const

/**
 * Build the invoice application schema.
 * The schema is a factory because validation messages are i18n keys resolved
 * through `t` at render time.
 */
export function getInvoiceFormSchema(t: (key: string) => string) {
  return z
    .object({
      title_type: z.enum(['personal', 'company']),
      title: z
        .string()
        .trim()
        .min(
          INVOICE_VALIDATION.TITLE_MIN_LENGTH,
          t('Invoice title is required')
        )
        .max(
          INVOICE_VALIDATION.TITLE_MAX_LENGTH,
          t('Invoice title must be at most 100 characters')
        ),
      tax_id: z
        .string()
        .trim()
        .max(
          INVOICE_VALIDATION.TAX_ID_MAX_LENGTH,
          t('Tax ID must be at most 64 characters')
        ),
      email: z
        .string()
        .trim()
        .min(1, t('Receiving email is required'))
        .max(
          INVOICE_VALIDATION.EMAIL_MAX_LENGTH,
          t('Email must be at most 255 characters')
        )
        .email(t('Invalid email address')),
    })
    .refine(
      (values) =>
        values.title_type !== 'company' || values.tax_id.trim().length > 0,
      {
        message: t('Tax ID is required for company invoices'),
        path: ['tax_id'],
      }
    )
}

export type InvoiceFormValues = z.infer<ReturnType<typeof getInvoiceFormSchema>>

export const INVOICE_FORM_DEFAULT_VALUES: InvoiceFormValues = {
  title_type: 'personal',
  title: '',
  tax_id: '',
  email: '',
}
