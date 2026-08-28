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
import type { Row } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { INVOICE_STATUS } from '../constants'
import type { Invoice } from '../types'
import { useInvoices } from './invoices-provider'

interface DataTableRowActionsProps {
  row: Row<Invoice>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const invoice = row.original
  const { setOpen, setCurrentRow } = useInvoices()

  if (invoice.status !== INVOICE_STATUS.PENDING) {
    return <span className='text-muted-foreground text-xs'>—</span>
  }

  const openIssue = () => {
    setCurrentRow(invoice)
    setOpen('issue')
  }

  const openReject = () => {
    setCurrentRow(invoice)
    setOpen('reject')
  }

  return (
    <div className='-ml-1.5 flex items-center gap-1'>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={openIssue}
              aria-label={t('Mark as Issued')}
            />
          }
        >
          <Check />
        </TooltipTrigger>
        <TooltipContent>{t('Mark as Issued')}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={openReject}
              aria-label={t('Reject')}
            />
          }
        >
          <X />
        </TooltipTrigger>
        <TooltipContent>{t('Reject')}</TooltipContent>
      </Tooltip>
    </div>
  )
}
