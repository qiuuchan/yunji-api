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
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { reviewInvoice } from '../api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import { getRejectInvoiceSchema, type RejectInvoiceValues } from '../lib'
import { useInvoices } from './invoices-provider'

const REJECT_FORM_ID = 'invoice-reject-form'

/**
 * Confirmation dialog for rejecting an application. A reason is mandatory
 * because the user reads it before resubmitting.
 */
export function InvoicesRejectDialog() {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, triggerRefresh } = useInvoices()
  const [submitting, setSubmitting] = useState(false)
  const schema = useMemo(() => getRejectInvoiceSchema(t), [t])

  const form = useForm<RejectInvoiceValues>({
    resolver: zodResolver(schema),
    defaultValues: { admin_remark: '' },
  })

  useEffect(() => {
    if (open === 'reject') {
      form.reset({ admin_remark: '' })
    }
  }, [form, open])

  const handleSubmit = async (values: RejectInvoiceValues) => {
    if (!currentRow) return
    setSubmitting(true)
    try {
      const result = await reviewInvoice({
        id: currentRow.id,
        action: 'reject',
        admin_remark: values.admin_remark.trim(),
        invoice_url: '',
      })
      if (result.success) {
        toast.success(t(SUCCESS_MESSAGES.REJECTED))
        setOpen(null)
        triggerRefresh()
      } else {
        toast.error(result.message || t(ERROR_MESSAGES.REVIEW_FAILED))
      }
    } catch {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setOpen(null)
  }

  return (
    <AlertDialog open={open === 'reject'} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Reject')}</AlertDialogTitle>
          <AlertDialogDescription render={<div />}>
            {t(
              'The rejection reason will be shown to the user, who can then resubmit the application.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            id={REJECT_FORM_ID}
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-2'
          >
            <FormField
              control={form.control}
              name='admin_remark'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Rejection reason')}</FormLabel>
                  <FormControl>
                    <Input
                      aria-label={t('Rejection reason')}
                      placeholder={t(
                        'Explain why this application is rejected'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>
            {t('Cancel')}
          </AlertDialogCancel>
          <Button
            type='submit'
            form={REJECT_FORM_ID}
            variant='destructive'
            disabled={submitting}
          >
            {submitting ? t('Processing...') : t('Reject')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
