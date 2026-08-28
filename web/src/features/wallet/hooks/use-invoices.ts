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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import i18next from 'i18next'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { getUserInvoices, submitInvoiceApplication } from '../api'
import type { InvoiceRecord, SubmitInvoiceRequest } from '../types'

// ============================================================================
// Invoice Hooks
// ============================================================================

/** React Query key factory for the current user's invoice applications */
export const invoiceKeys = {
  all: ['invoices'] as const,
  self: (page: number, pageSize: number) =>
    ['invoices', 'self', page, pageSize] as const,
}

/**
 * Load the current user's invoice applications, indexed by topup id so the
 * billing history can look up each record's application in constant time.
 */
export function useInvoices(enabled: boolean, pageSize = 100) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: invoiceKeys.self(1, pageSize),
    queryFn: async () => {
      const response = await getUserInvoices(1, pageSize)
      if (!response.success || !response.data) {
        throw new Error(
          response.message || i18next.t('Failed to load invoices')
        )
      }
      return response.data.items ?? []
    },
    enabled,
    staleTime: 30_000,
  })

  const invoiceByTopupId = useMemo(() => {
    const map = new Map<number, InvoiceRecord>()
    for (const invoice of query.data ?? []) {
      // 一条充值记录最多一条申请，后出现的（更新的 id）覆盖前值
      const existing = map.get(invoice.topup_id)
      if (!existing || invoice.id > existing.id) {
        map.set(invoice.topup_id, invoice)
      }
    }
    return map
  }, [query.data])

  const submitMutation = useMutation({
    mutationFn: async (request: SubmitInvoiceRequest) => {
      const response = await submitInvoiceApplication(request)
      if (!response.success) {
        throw new Error(
          response.message || i18next.t('Failed to submit invoice application')
        )
      }
      return response
    },
    onSuccess: () => {
      toast.success(i18next.t('Invoice application submitted successfully'))
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    invoices: query.data ?? [],
    invoiceByTopupId,
    isLoading: query.isLoading,
    submitInvoice: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  }
}
