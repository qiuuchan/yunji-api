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
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { TopupRecord } from '../../../types'
import { InvoiceDialog } from '../invoice-dialog'

const i18n = (await import('i18next')).default
const { I18nextProvider, initReactI18next } = await import('react-i18next')

await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'Apply for Invoice': 'Apply for Invoice',
        Cancel: 'Cancel',
        Company: 'Company',
        'Company name': 'Company name',
        'Email address': 'Email address',
        'Invoice Title': 'Invoice Title',
        'Invalid email address': 'Invalid email address',
        Optional: 'Optional',
        'Order Number': 'Order Number',
        Amount: 'Amount',
        Personal: 'Personal',
        'Personal name': 'Personal name',
        'Receiving Email': 'Receiving Email',
        'Receiving email is required': 'Receiving email is required',
        'Required for company invoices': 'Required for company invoices',
        Submit: 'Submit',
        'Tax ID': 'Tax ID',
        'Tax ID is required for company invoices':
          'Tax ID is required for company invoices',
        'Taxpayer identification number': 'Taxpayer identification number',
        'Title Type': 'Title Type',
        'Submit your invoice title and email, and we will issue an electronic invoice after review':
          'Submit your invoice title and email, and we will issue an electronic invoice after review',
      },
    },
  },
})

const record: TopupRecord = {
  id: 42,
  user_id: 1,
  amount: 10,
  money: 9.5,
  trade_no: '20260828001invoice',
  payment_method: 'stripe',
  create_time: 1787000000,
  status: 'success',
}

type InvoiceDialogProps = React.ComponentProps<typeof InvoiceDialog>

function renderDialog(overrides: Partial<InvoiceDialogProps> = {}) {
  const defaultSubmit = vi.fn(async () => true)
  const onOpenChange = vi.fn()
  const onSubmit = overrides.onSubmit ?? defaultSubmit

  const view = render(
    <I18nextProvider i18n={i18n}>
      <InvoiceDialog
        open
        onOpenChange={onOpenChange}
        record={record}
        submitting={false}
        {...overrides}
        onSubmit={onSubmit}
      />
    </I18nextProvider>
  )

  return { ...view, onSubmit, onOpenChange }
}

/** Fill a labelled text field by its accessible label */
function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

beforeEach(() => {
  i18n.changeLanguage('en')
})

describe('InvoiceDialog', () => {
  test('shows the order number and amount of the related topup', () => {
    renderDialog()

    expect(screen.getByText(record.trade_no)).toBeInTheDocument()
    expect(screen.getByText('9.5')).toBeInTheDocument()
  })

  test('submits a valid personal application without a tax ID', async () => {
    const { onSubmit } = renderDialog()

    fill('Invoice Title', 'Zhang San')
    fill('Receiving Email', 'user@example.com')
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title_type: 'personal',
          title: 'Zhang San',
          email: 'user@example.com',
        }),
        record.id
      )
    })
  })

  test('blocks submission and reports a missing email', async () => {
    const { onSubmit } = renderDialog()

    fill('Invoice Title', 'Zhang San')
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(
        screen.getByText('Receiving email is required')
      ).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('blocks submission and reports an invalid email', async () => {
    const { onSubmit } = renderDialog()

    fill('Invoice Title', 'Zhang San')
    const emailInput = screen.getByLabelText('Receiving Email')
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
    expect(emailInput).toHaveValue('not-an-email')

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('requires a tax ID once the company title type is selected', async () => {
    const { onSubmit } = renderDialog()

    fireEvent.click(screen.getByRole('radio', { name: 'Company' }))
    fill('Invoice Title', 'Example Technology Co., Ltd.')
    fill('Receiving Email', 'finance@example.com')
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(
        screen.getByText('Tax ID is required for company invoices')
      ).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('submits a valid company application with a tax ID', async () => {
    const { onSubmit } = renderDialog()

    fireEvent.click(screen.getByRole('radio', { name: 'Company' }))
    fill('Invoice Title', 'Example Technology Co., Ltd.')
    fill('Tax ID', '91310000MA1FL0Q84K')
    fill('Receiving Email', 'finance@example.com')
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title_type: 'company',
          title: 'Example Technology Co., Ltd.',
          tax_id: '91310000MA1FL0Q84K',
        }),
        record.id
      )
    })
  })

  test('prefills from the most recent application when opening', async () => {
    renderDialog({
      lastInvoice: {
        id: 7,
        user_id: 1,
        topup_id: 11,
        trade_no: 'OLD123',
        amount: 5,
        title_type: 'company',
        title: 'Prefilled Ltd.',
        tax_id: '91310000MA1FL0Q84K',
        email: 'prefill@example.com',
        status: 'issued',
        admin_remark: '',
        invoice_url: '',
        create_time: 1787000000,
        update_time: 1787000000,
      },
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Invoice Title')).toHaveValue(
        'Prefilled Ltd.'
      )
    })
    expect(screen.getByLabelText('Tax ID')).toHaveValue('91310000MA1FL0Q84K')
    expect(screen.getByLabelText('Receiving Email')).toHaveValue(
      'prefill@example.com'
    )
    expect(screen.getByRole('radio', { name: 'Company' })).toBeChecked()
  })

  test('stays open when the server rejects the submission', async () => {
    const { onSubmit, onOpenChange } = renderDialog({
      onSubmit: vi.fn(async () => false),
    })

    fill('Invoice Title', 'Zhang San')
    fill('Receiving Email', 'user@example.com')
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  test('disables the submit button while submitting', () => {
    renderDialog({ submitting: true })

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })
})
