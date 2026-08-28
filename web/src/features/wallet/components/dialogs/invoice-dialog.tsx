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
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatNumber } from '@/lib/format'

import {
  getInvoiceFormSchema,
  INVOICE_FORM_DEFAULT_VALUES,
  type InvoiceFormValues,
} from '../../lib/invoice-schema'
import type { InvoiceRecord, TopupRecord } from '../../types'

const INVOICE_FORM_ID = 'invoice-application-form'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Topup record the application belongs to */
  record: TopupRecord | null
  /** Existing application for this record, used to prefill on reopen */
  existingInvoice?: InvoiceRecord | undefined
  /** Most recent application of the user, used to prefill a first application */
  lastInvoice?: InvoiceRecord | undefined
  submitting: boolean
  onSubmit: (values: InvoiceFormValues, topupId: number) => Promise<boolean>
}

export function InvoiceDialog(props: InvoiceDialogProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => getInvoiceFormSchema(t), [t])

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: INVOICE_FORM_DEFAULT_VALUES,
  })

  const titleType = form.watch('title_type')

  // Prefill from the record's own application, else the user's last one
  useEffect(() => {
    if (!props.open) return

    const source = props.existingInvoice ?? props.lastInvoice
    form.reset({
      title_type: source?.title_type ?? 'personal',
      title: source?.title ?? '',
      tax_id: source?.tax_id ?? '',
      email: source?.email ?? '',
    })
  }, [form, props.existingInvoice, props.lastInvoice, props.open])

  const handleSubmit = async (values: InvoiceFormValues) => {
    if (!props.record) return
    const success = await props.onSubmit(values, props.record.id)
    if (success) {
      props.onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('Apply for Invoice')}
      description={t(
        'Submit your invoice title and email, and we will issue an electronic invoice after review'
      )}
      contentClassName='max-sm:w-[calc(100vw-1.5rem)] sm:max-w-md'
      contentHeight='auto'
      bodyClassName='space-y-4'
      footerClassName='grid grid-cols-2 gap-2 sm:flex'
      footer={
        <>
          <Button
            variant='outline'
            onClick={() => props.onOpenChange(false)}
            disabled={props.submitting}
          >
            {t('Cancel')}
          </Button>
          <Button
            type='submit'
            form={INVOICE_FORM_ID}
            disabled={props.submitting}
          >
            {props.submitting && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            {t('Submit')}
          </Button>
        </>
      }
    >
      <div className='space-y-4 py-3 sm:py-4'>
        {props.record && (
          <div className='grid grid-cols-2 gap-3 rounded-lg border p-3'>
            <div className='space-y-1'>
              <Label className='text-muted-foreground text-xs'>
                {t('Order Number')}
              </Label>
              <div className='truncate font-mono text-xs'>
                {props.record.trade_no}
              </div>
            </div>
            <div className='space-y-1'>
              <Label className='text-muted-foreground text-xs'>
                {t('Amount')}
              </Label>
              <div className='text-sm font-semibold'>
                {formatNumber(props.record.money)}
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            id={INVOICE_FORM_ID}
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='title_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Title Type')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as InvoiceFormValues['title_type'])
                      }
                      className='flex gap-4'
                    >
                      <div className='flex items-center gap-2'>
                        <RadioGroupItem
                          value='personal'
                          id='invoice-personal'
                        />
                        <Label htmlFor='invoice-personal'>
                          {t('Personal')}
                        </Label>
                      </div>
                      <div className='flex items-center gap-2'>
                        <RadioGroupItem value='company' id='invoice-company' />
                        <Label htmlFor='invoice-company'>{t('Company')}</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Invoice Title')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        titleType === 'company'
                          ? t('Company name')
                          : t('Personal name')
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tax_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('Tax ID')}
                    {titleType !== 'company' && (
                      <span className='text-muted-foreground ml-1 text-xs font-normal'>
                        ({t('Optional')})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Taxpayer identification number')}
                      {...field}
                    />
                  </FormControl>
                  {titleType === 'company' && (
                    <FormDescription>
                      {t('Required for company invoices')}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Receiving Email')}</FormLabel>
                  <FormControl>
                    {/* 不用 type='email'：原生校验会先于 zod 拦截提交，
                        用户只能看到浏览器默认气泡而不是本地化的错误提示 */}
                    <Input
                      type='text'
                      inputMode='email'
                      autoComplete='email'
                      placeholder={t('Email address')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </Dialog>
  )
}
