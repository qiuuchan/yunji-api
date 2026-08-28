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
import { describe, expect, test } from 'vitest'

import { getInvoiceAction, getInvoiceStatusConfig } from '../billing'

describe('getInvoiceStatusConfig', () => {
  test('maps pending to the pending issuance label', () => {
    expect(getInvoiceStatusConfig('pending')).toEqual({
      variant: 'warning',
      labelKey: 'Pending Issuance',
    })
  })

  test('maps issued to the issued label', () => {
    expect(getInvoiceStatusConfig('issued')).toEqual({
      variant: 'success',
      labelKey: 'Issued',
    })
  })

  test('maps rejected to the rejected label', () => {
    expect(getInvoiceStatusConfig('rejected')).toEqual({
      variant: 'danger',
      labelKey: 'Rejected',
    })
  })

  test('falls back to pending for an unknown status', () => {
    expect(getInvoiceStatusConfig('archived' as 'pending').labelKey).toBe(
      'Pending Issuance'
    )
  })
})

describe('getInvoiceAction', () => {
  test('offers apply for a successful topup with no application', () => {
    const action = getInvoiceAction({
      isAdminView: false,
      topupStatus: 'success',
      invoice: undefined,
    })

    expect(action).toBe('apply')
  })

  test('offers resubmit after a rejection', () => {
    const action = getInvoiceAction({
      isAdminView: false,
      topupStatus: 'success',
      invoice: { status: 'rejected' },
    })

    expect(action).toBe('resubmit')
  })

  test('offers nothing while an application is pending', () => {
    const action = getInvoiceAction({
      isAdminView: false,
      topupStatus: 'success',
      invoice: { status: 'pending' },
    })

    expect(action).toBe('none')
  })

  test('offers nothing once the invoice has been issued', () => {
    const action = getInvoiceAction({
      isAdminView: false,
      topupStatus: 'success',
      invoice: { status: 'issued' },
    })

    expect(action).toBe('none')
  })

  test('offers nothing for a non-successful topup', () => {
    const action = getInvoiceAction({
      isAdminView: false,
      topupStatus: 'pending',
      invoice: undefined,
    })

    expect(action).toBe('none')
  })

  test('offers nothing in the admin view even for a successful topup', () => {
    const action = getInvoiceAction({
      isAdminView: true,
      topupStatus: 'success',
      invoice: undefined,
    })

    expect(action).toBe('none')
  })
})
