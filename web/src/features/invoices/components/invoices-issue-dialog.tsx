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
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Dialog } from '@/components/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { reviewInvoice } from '../api'
import {
  ERROR_MESSAGES,
  INVOICE_VALIDATION,
  SUCCESS_MESSAGES,
} from '../constants'
import { getIssueInvoiceSchema, type IssueInvoiceValues } from '../lib'
import { useInvoices } from './invoices-provider'

const ISSUE_FORM_ID = 'invoice-issue-form'

/**
 * Dialog for marking an application as issued. The invoice link and remark
 * are both optional here — the invoice itself is issued offline.
 */
export function InvoicesIssueDialog() {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, triggerRefresh } = useInvoices()
  const [submitting, setSubmitting] = useState(false)
  const schema = useMemo(() => getIssueInvoiceSchema(t), [t])

  const form = useForm<IssueInvoiceValues>({
    resolver: zodResolver(schema),
    defaultValues: { invoice_url: '', admin_remark: '' },
  })

  useEffect(() => {
    if (open === 'issue') {
      form.reset({
        invoice_url: currentRow?.invoice_url ?? '',
        admin_remark: currentRow?.admin_remark ?? '',
      })
    }
  }, [currentRow, form, open])

  const handleSubmit = async (values: IssueInvoiceValues) => {
    if (!currentRow) return
    setSubmitting(true)
    try {
      const result = await reviewInvoice({
        id: currentRow.id,
        action: 'issue',
        admin_remark: values.admin_remark.trim(),
        invoice_url: values.invoice_url.trim(),
      })
      if (result.success) {
        toast.success(t(SUCCESS_MESSAGES.ISSUED))
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

  return (
    <Dialog
      open={open === 'issue'}
      onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      title={t('Mark as Issued')}
      description={t(
        'Attach the issued invoice link (optional) and confirm the application'
      )}
      contentClassName='max-sm:w-[calc(100vw-1.5rem)] sm:max-w-md'
      contentHeight='auto'
      bodyClassName='space-y-4'
      footerClassName='grid grid-cols-2 gap-2 sm:flex'
      footer={
        <>
          <Button
            variant='outline'
            onClick={() => setOpen(null)}
            disabled={submitting}
          >
            {t('Cancel')}
          </Button>
          <Button type='submit' form={ISSUE_FORM_ID} disabled={submitting}>
            {submitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('Confirm')}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          id={ISSUE_FORM_ID}
          onSubmit={form.handleSubmit(handleSubmit)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='invoice_url'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Invoice Link')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://'
                    maxLength={INVOICE_VALIDATION.URL_MAX_LENGTH}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t('Optional')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='admin_remark'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Remark')}</FormLabel>
                <FormControl>
                  <Input
                    maxLength={INVOICE_VALIDATION.REMARK_MAX_LENGTH}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t('Optional')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Dialog>
  )
}
