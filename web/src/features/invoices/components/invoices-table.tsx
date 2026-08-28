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
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { DataTablePage, useDataTable } from '@/components/data-table'
import { useMediaQuery } from '@/hooks'
import { useTableUrlState } from '@/hooks/use-table-url-state'

import { getInvoices } from '../api'
import { ERROR_MESSAGES, getInvoiceStatusOptions } from '../constants'
import type { Invoice, InvoiceStatus } from '../types'
import { useInvoicesColumns } from './invoices-columns'
import { useInvoices } from './invoices-provider'

const route = getRouteApi('/_authenticated/invoices/')

export function InvoicesTable() {
  const { t } = useTranslation()
  const columns = useInvoicesColumns()
  const { refreshTrigger } = useInvoices()
  const isMobile = useMediaQuery('(max-width: 640px)')

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: isMobile ? 10 : 20 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'array' }],
  })

  const statusFilter =
    (columnFilters.find((filter) => filter.id === 'status')?.value as
      | string[]
      | undefined) ?? []
  const statusFilterValue = statusFilter[0] ?? ''

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'invoices',
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter,
      statusFilterValue,
      refreshTrigger,
    ],
    queryFn: async () => {
      const result = await getInvoices({
        p: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
        status: statusFilterValue as InvoiceStatus | '',
        keyword: globalFilter ?? '',
      })

      if (!result.success) {
        toast.error(result.message || t(ERROR_MESSAGES.LOAD_FAILED))
        return { items: [] as Invoice[], total: 0 }
      }
      return {
        items: result.data?.items ?? [],
        total: result.data?.total ?? 0,
      }
    },
    placeholderData: (previousData) => previousData,
  })

  const invoices = data?.items ?? []

  const { table } = useDataTable({
    data: invoices,
    columns,
    columnFilters,
    globalFilter,
    pagination,
    globalFilterFn: (row, _columnId, filterValue) => {
      const invoice = row.original as Invoice
      const searchValue = String(filterValue).toLowerCase()
      return (
        invoice.trade_no.toLowerCase().includes(searchValue) ||
        invoice.title.toLowerCase().includes(searchValue)
      )
    },
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableSorting: false,
    totalCount: data?.total ?? 0,
    ensurePageInRange,
  })

  const statusOptions = useMemo(() => getInvoiceStatusOptions(t), [t])

  return (
    <DataTablePage
      table={table}
      columns={columns}
      isLoading={isLoading}
      isFetching={isFetching}
      emptyTitle={t('No Invoices Found')}
      emptyDescription={t(
        'No invoice applications yet. They will appear here once users submit them.'
      )}
      skeletonKeyPrefix='invoices-skeleton'
      applyHeaderSize
      toolbarProps={{
        searchPlaceholder: t('Filter by order number or title...'),
        searchDebounceMs: 500,
        filters: [
          {
            columnId: 'status',
            title: t('Status'),
            options: statusOptions,
            singleSelect: true,
          },
        ],
      }}
    />
  )
}
