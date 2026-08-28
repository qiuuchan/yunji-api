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
import {
  Search,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ReceiptText,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { StatusBadge } from '@/components/status-badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatCurrencyFromUSD } from '@/lib/currency'
import { formatNumber } from '@/lib/format'

import { useBillingHistory } from '../../hooks/use-billing-history'
import { useInvoices } from '../../hooks/use-invoices'
import {
  getStatusConfig,
  getPaymentMethodName,
  getInvoiceStatusConfig,
  getInvoiceAction,
  formatTimestamp,
} from '../../lib/billing'
import type { InvoiceFormValues } from '../../lib/invoice-schema'
import type { InvoiceRecord, TopupRecord } from '../../types'
import { InvoiceDialog } from './invoice-dialog'

interface BillingHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface InvoiceActionsProps {
  record: TopupRecord
  invoice: InvoiceRecord | undefined
  onApply: () => void
}

/**
 * Per-record invoice affordance: an apply/resubmit button, or a status badge
 * with an optional link to the issued invoice.
 */
function InvoiceActions(props: InvoiceActionsProps) {
  const { t } = useTranslation()

  const action = getInvoiceAction({
    isAdminView: false,
    topupStatus: props.record.status,
    invoice: props.invoice,
  })

  if (action === 'apply') {
    return (
      <Button size='sm' variant='outline' onClick={props.onApply}>
        <ReceiptText className='mr-1 h-3.5 w-3.5' />
        {t('Apply for Invoice')}
      </Button>
    )
  }

  if (action === 'resubmit') {
    return (
      <div className='flex flex-wrap items-center justify-end gap-2'>
        {props.invoice?.admin_remark && (
          <span className='text-muted-foreground text-xs'>
            {t('Rejection reason:')} {props.invoice.admin_remark}
          </span>
        )}
        <Button size='sm' variant='outline' onClick={props.onApply}>
          <ReceiptText className='mr-1 h-3.5 w-3.5' />
          {t('Resubmit')}
        </Button>
      </div>
    )
  }

  if (!props.invoice) return null

  const config = getInvoiceStatusConfig(props.invoice.status)
  return (
    <div className='flex flex-wrap items-center justify-end gap-2'>
      <StatusBadge
        label={t(config.labelKey)}
        variant={config.variant}
        showDot
        copyable={false}
      />
      {props.invoice.status === 'issued' && props.invoice.invoice_url && (
        <a
          href={props.invoice.invoice_url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary inline-flex items-center gap-1 text-xs hover:underline'
        >
          {t('View Invoice')}
          <ExternalLink className='h-3.5 w-3.5' aria-hidden='true' />
        </a>
      )}
    </div>
  )
}

export function BillingHistoryDialog({
  open,
  onOpenChange,
}: BillingHistoryDialogProps) {
  const { t } = useTranslation()
  const {
    records,
    total,
    page,
    pageSize,
    keyword,
    loading,
    completing,
    isAdmin,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleCompleteOrder,
  } = useBillingHistory()

  const { invoiceByTopupId, invoices, isSubmitting, submitInvoice } =
    useInvoices(open && !isAdmin)

  const [confirmTradeNo, setConfirmTradeNo] = useState<string | null>(null)
  const [invoiceRecord, setInvoiceRecord] = useState<TopupRecord | null>(null)
  const { copyToClipboard, copiedText } = useCopyToClipboard({ notify: false })

  const totalPages = Math.ceil(total / pageSize)

  const handleConfirmComplete = async () => {
    if (confirmTradeNo) {
      const success = await handleCompleteOrder(confirmTradeNo)
      if (success) {
        setConfirmTradeNo(null)
      }
    }
  }

  const handleSubmitInvoice = async (
    values: InvoiceFormValues,
    topupId: number
  ) => {
    try {
      await submitInvoice({
        topup_id: topupId,
        title_type: values.title_type,
        title: values.title.trim(),
        tax_id: values.tax_id.trim(),
        email: values.email.trim(),
      })
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={t('Billing History')}
        description={t(
          'View your topup transaction records and payment history'
        )}
        contentClassName='flex max-h-[calc(100dvh-2rem)] flex-col max-sm:w-screen max-sm:max-w-none max-sm:rounded-none max-sm:p-4 sm:max-w-4xl'
        contentHeight='auto'
        bodyClassName='space-y-3'
      >
        <div className='min-h-0 space-y-3'>
          {/* Search and Filter Bar */}
          <div className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder={t('Search by order number...')}
                value={keyword}
                onChange={(e) => handleSearch(e.target.value)}
                className='h-9 pl-10'
              />
            </div>
            <Select
              items={[
                { value: '10', label: t('10 / page') },
                { value: '20', label: t('20 / page') },
                { value: '50', label: t('50 / page') },
                { value: '100', label: t('100 / page') },
              ]}
              value={pageSize.toString()}
              onValueChange={(value) =>
                value !== null && handlePageSizeChange(parseInt(value))
              }
            >
              <SelectTrigger className='h-9 w-[92px] sm:w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  <SelectItem value='10'>{t('10 / page')}</SelectItem>
                  <SelectItem value='20'>{t('20 / page')}</SelectItem>
                  <SelectItem value='50'>{t('50 / page')}</SelectItem>
                  <SelectItem value='100'>{t('100 / page')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Records List */}
          <div className='max-h-[min(54vh,520px)] overflow-y-auto pr-1'>
            {loading ? (
              <div className='space-y-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='rounded-lg border p-3 sm:p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-48' />
                        <Skeleton className='h-3 w-32' />
                      </div>
                      <Skeleton className='h-5 w-16' />
                    </div>
                    <div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'>
                      <Skeleton className='h-3 w-full' />
                      <Skeleton className='h-3 w-full' />
                      <Skeleton className='h-3 w-full' />
                    </div>
                  </div>
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className='text-muted-foreground flex min-h-40 flex-col items-center justify-center py-10 text-center'>
                <p className='text-sm font-medium'>
                  {t('No billing records found')}
                </p>
                <p className='mt-1 text-xs'>
                  {keyword
                    ? t('Try adjusting your search')
                    : t('Your transaction history will appear here')}
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {records.map((record) => {
                  const statusConfig = getStatusConfig(record.status)
                  return (
                    <div
                      key={record.id}
                      className='rounded-lg border p-3 sm:p-4'
                    >
                      {/* Header Row */}
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 space-y-1'>
                          <div className='flex min-w-0 items-center gap-2'>
                            <code className='text-foreground truncate font-mono text-sm'>
                              {record.trade_no}
                            </code>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-5 w-5 p-0'
                              onClick={() => copyToClipboard(record.trade_no)}
                            >
                              {copiedText === record.trade_no ? (
                                <Check className='h-3 w-3' />
                              ) : (
                                <Copy className='h-3 w-3' />
                              )}
                            </Button>
                            {isAdmin && record.user_id != null && (
                              <StatusBadge
                                label={`${t('User ID')}: ${record.user_id}`}
                                variant='neutral'
                                size='sm'
                                copyText={String(record.user_id)}
                              />
                            )}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {formatTimestamp(record.create_time)}
                          </div>
                        </div>
                        <StatusBadge
                          label={statusConfig.label}
                          variant={statusConfig.variant}
                          showDot
                          copyable={false}
                        />
                      </div>

                      {/* Details Grid */}
                      <div className='mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4'>
                        <div className='space-y-1'>
                          <Label className='text-muted-foreground text-xs'>
                            {t('Payment Method')}
                          </Label>
                          <div className='text-sm font-medium'>
                            {getPaymentMethodName(record.payment_method, t)}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-muted-foreground text-xs'>
                            {t('Amount')}
                          </Label>
                          <div className='text-sm font-semibold'>
                            {formatCurrencyFromUSD(record.amount, {
                              digitsLarge: 2,
                              digitsSmall: 2,
                              abbreviate: false,
                            })}
                          </div>
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-muted-foreground text-xs'>
                            {t('Payment')}
                          </Label>
                          <div className='text-sm font-semibold text-red-600'>
                            {formatNumber(record.money)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {(isAdmin && record.status === 'pending') ||
                      getInvoiceAction({
                        isAdminView: isAdmin,
                        topupStatus: record.status,
                        invoice: invoiceByTopupId.get(record.id),
                      }) !== 'none' ||
                      invoiceByTopupId.get(record.id) ? (
                        <div className='mt-4 flex flex-wrap items-center justify-end gap-2'>
                          <InvoiceActions
                            record={record}
                            invoice={invoiceByTopupId.get(record.id)}
                            onApply={() => setInvoiceRecord(record)}
                          />
                          {isAdmin && record.status === 'pending' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setConfirmTradeNo(record.trade_no)}
                              disabled={completing}
                            >
                              {t('Complete Order')}
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && records.length > 0 && (
            <div className='flex flex-col items-center gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='text-muted-foreground text-xs sm:text-sm'>
                {t('Showing')} {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, total)} {t('of')} {total}
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className='h-8 w-8 p-0'
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                  <span className='font-medium'>{page}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className='h-8 w-8 p-0'
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Confirm Complete Order Dialog */}
      <AlertDialog
        open={!!confirmTradeNo}
        onOpenChange={(open) => !open && setConfirmTradeNo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Complete Order')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'Are you sure you want to manually complete this order? The user will be credited with the corresponding quota.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completing}>
              {t('Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              disabled={completing}
            >
              {completing ? t('Processing...') : t('Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Application Dialog */}
      <InvoiceDialog
        open={!!invoiceRecord}
        onOpenChange={(isOpen) => !isOpen && setInvoiceRecord(null)}
        record={invoiceRecord}
        existingInvoice={
          invoiceRecord ? invoiceByTopupId.get(invoiceRecord.id) : undefined
        }
        lastInvoice={invoices[0]}
        submitting={isSubmitting}
        onSubmit={handleSubmitInvoice}
      />
    </>
  )
}
