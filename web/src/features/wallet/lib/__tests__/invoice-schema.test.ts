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

import { getInvoiceFormSchema } from '../invoice-schema'

// identity t() keeps assertions independent of real translations
const identity = (key: string) => key
const schema = getInvoiceFormSchema(identity)

function parse(values: Record<string, unknown>) {
  return schema.safeParse(values)
}

const validPersonal = {
  title_type: 'personal',
  title: 'Zhang San',
  tax_id: '',
  email: 'user@example.com',
}

describe('invoice form schema', () => {
  test('accepts a personal application without a tax ID', () => {
    const result = parse(validPersonal)

    expect(result.success).toBe(true)
  })

  test('accepts a company application that provides a tax ID', () => {
    const result = parse({
      ...validPersonal,
      title_type: 'company',
      title: 'Example Technology Co., Ltd.',
      tax_id: '91310000MA1FL0Q84K',
    })

    expect(result.success).toBe(true)
  })

  test('rejects a company application with an empty tax ID', () => {
    const result = parse({
      ...validPersonal,
      title_type: 'company',
      title: 'Example Technology Co., Ltd.',
      tax_id: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['tax_id'])
      expect(result.error.issues[0].message).toBe(
        'Tax ID is required for company invoices'
      )
    }
  })

  test('rejects a company application whose tax ID is only whitespace', () => {
    const result = parse({
      ...validPersonal,
      title_type: 'company',
      tax_id: '   ',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['tax_id'])
    }
  })

  test('rejects an invalid email address', () => {
    const result = parse({ ...validPersonal, email: 'not-an-email' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
      expect(result.error.issues[0].message).toBe('Invalid email address')
    }
  })

  test('rejects an empty email address', () => {
    const result = parse({ ...validPersonal, email: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
      expect(result.error.issues[0].message).toBe('Receiving email is required')
    }
  })

  test('rejects an empty invoice title', () => {
    const result = parse({ ...validPersonal, title: '  ' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['title'])
      expect(result.error.issues[0].message).toBe('Invoice title is required')
    }
  })

  test('rejects a title longer than 100 characters', () => {
    const result = parse({ ...validPersonal, title: 'a'.repeat(101) })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['title'])
      expect(result.error.issues[0].message).toBe(
        'Invoice title must be at most 100 characters'
      )
    }
  })

  test('accepts a title of exactly 100 characters', () => {
    const result = parse({ ...validPersonal, title: 'a'.repeat(100) })

    expect(result.success).toBe(true)
  })

  test('rejects an unknown title type', () => {
    const result = parse({ ...validPersonal, title_type: 'government' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['title_type'])
    }
  })
})
