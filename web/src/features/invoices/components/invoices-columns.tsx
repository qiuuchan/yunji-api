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
import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { LongText } from '@/components/long-text'
import { StatusBadge } from '@/components/status-badge'
import { TableId } from '@/components/table-id'
import { formatNumber, formatTimestamp } from '@/lib/format'

import { INVOICE_STATUSES, INVOICE_STATUS } from '../constants'
import type { Invoice } from '../types'
import { DataTableRowActions } from './data-table-row-actions'

export function useInvoicesColumns(): ColumnDef<Invoice>[] {
  const { t } = useTranslation()

  return [
    {
      accessorKey: 'id',
      header: () => t('ID'),
      cell: ({ row }) => <TableId value={row.original.id} />,
      enableSorting: false,
      size: 70,
    },
    {
      accessorKey: 'create_time',
      header: () => t('Applied At'),
      cell: ({ row }) => (
        <div className='text-xs'>
          {formatTimestamp(row.original.create_time)}
        </div>
      ),
      enableSorting: false,
      size: 140,
    },
    {
      accessorKey: 'user_id',
      header: () => t('User ID'),
      cell: ({ row }) => <TableId value={row.original.user_id} />,
      enableSorting: false,
      size: 90,
    },
    {
      accessorKey: 'trade_no',
      header: () => t('Order Number'),
      cell: ({ row }) => (
        <LongText className='font-mono text-xs'>
          {row.original.trade_no}
        </LongText>
      ),
      enableSorting: false,
      size: 180,
    },
    {
      accessorKey: 'amount',
      header: () => t('Amount'),
      cell: ({ row }) => (
        <div className='text-sm font-semibold'>
          {formatNumber(row.original.amount)}
        </div>
      ),
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: 'title',
      header: () => t('Invoice Title'),
      cell: ({ row }) => {
        const invoice = row.original
        const typeLabel =
          invoice.title_type === 'company' ? t('Company') : t('Personal')
        return (
          <div className='space-y-0.5'>
            <LongText className='text-sm'>{invoice.title}</LongText>
            <div className='text-muted-foreground text-xs'>{typeLabel}</div>
          </div>
        )
      },
      enableSorting: false,
      size: 180,
    },
    {
      accessorKey: 'tax_id',
      header: () => t('Tax ID'),
      cell: ({ row }) =>
        row.original.tax_id ? (
          <LongText className='font-mono text-xs'>
            {row.original.tax_id}
          </LongText>
        ) : (
          <span className='text-muted-foreground text-xs'>—</span>
        ),
      enableSorting: false,
      size: 160,
    },
    {
      accessorKey: 'email',
      header: () => t('Receiving Email'),
      cell: ({ row }) => (
        <LongText className='text-xs'>{row.original.email}</LongText>
      ),
      enableSorting: false,
      size: 180,
    },
    {
      accessorKey: 'status',
      header: () => t('Status'),
      cell: ({ row }) => {
        const config =
          INVOICE_STATUSES[row.original.status] ??
          INVOICE_STATUSES[INVOICE_STATUS.PENDING]
        return (
          <StatusBadge
            label={t(config.labelKey)}
            variant={config.variant}
            showDot
            copyable={false}
          />
        )
      },
      filterFn: (row, id, value) => {
        const selected = value as string[] | undefined
        if (!selected || selected.length === 0) return true
        return selected.includes(String(row.getValue(id)))
      },
      enableSorting: false,
      size: 110,
    },
    {
      accessorKey: 'admin_remark',
      header: () => t('Remark'),
      cell: ({ row }) =>
        row.original.admin_remark ? (
          <LongText className='text-xs'>{row.original.admin_remark}</LongText>
        ) : (
          <span className='text-muted-foreground text-xs'>—</span>
        ),
      enableSorting: false,
      size: 160,
      meta: { mobileHidden: true },
    },
    {
      id: 'actions',
      header: () => t('Actions'),
      cell: ({ row }) => <DataTableRowActions row={row} />,
      enableSorting: false,
      size: 90,
      meta: { pinned: 'right' as const },
    },
  ]
}
