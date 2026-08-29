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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import { beforeAll, describe, expect, test } from 'vitest'

import type { PricingModel } from '../../types'
import { PricingCalculator } from '../pricing-calculator'

const model: PricingModel = {
  id: 1,
  model_name: 'test-model',
  quota_type: 0,
  model_ratio: 2,
  completion_ratio: 1.5,
  enable_groups: [],
}

beforeAll(() => {
  i18next.addResourceBundle('en', 'translation', {
    'Price Calculator': 'Price Calculator',
    'Estimate the cost of a request by model and token usage.':
      'Estimate the cost of a request by model and token usage.',
    'Select a model': 'Select a model',
    'Select group': 'Select group',
    'Token-based': 'Token-based',
    'Input tokens': 'Input tokens',
    'Output tokens': 'Output tokens',
    Requests: 'Requests',
    'Estimated cost': 'Estimated cost',
    '/ 1M tokens': '/ 1M tokens',
    '/ 1K tokens': '/ 1K tokens',
    Input: 'Input',
    Output: 'Output',
  })
})

function renderCalculator(tokenUnit: 'M' | 'K' = 'M') {
  return render(
    <PricingCalculator
      models={[model]}
      groupRatio={{}}
      priceRate={1}
      usdExchangeRate={1}
      tokenUnit={tokenUnit}
      showRechargePrice={false}
    />
  )
}

describe('PricingCalculator', () => {
  test('clamps a negative token input on blur', async () => {
    const user = userEvent.setup()
    renderCalculator()

    await user.selectOptions(
      screen.getByLabelText('Select a model'),
      'test-model'
    )
    const input = screen.getByLabelText('Input tokens')
    await user.type(input, '-100')
    await user.tab()

    expect(input).toHaveValue(0)
  })

  test('uses the selected token unit in the estimate label', async () => {
    const user = userEvent.setup()
    renderCalculator('K')

    await user.selectOptions(
      screen.getByLabelText('Select a model'),
      'test-model'
    )

    const renderedText = document.body.textContent ?? ''
    expect(renderedText.match(/\/ 1K tokens/g)).toHaveLength(2)
    expect(renderedText).not.toContain('/ 1M tokens')
  })
})
