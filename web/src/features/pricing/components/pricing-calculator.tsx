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
'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatBillingCurrencyFromUSD } from '@/lib/currency'

import { EXCLUDED_GROUPS, TOKEN_UNIT_DIVISORS } from '../constants'
import { computeEstimate } from '../lib/calculator'
import { isDynamicPricingModel } from '../lib/dynamic-price'
import type { PricingModel, TokenUnit } from '../types'

type PricingCalculatorProps = {
  models: PricingModel[]
  groupRatio: Record<string, number> // model.group_ratio (global map)
  priceRate: number
  usdExchangeRate: number
  tokenUnit: TokenUnit
  showRechargePrice: boolean
}

function normalizeMinimumValue(value: string, minimum: number): string {
  if (value === '') return value

  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue < minimum
    ? String(minimum)
    : value
}

export function PricingCalculator({
  models,
  priceRate,
  usdExchangeRate,
  tokenUnit,
  showRechargePrice,
}: PricingCalculatorProps) {
  const { t } = useTranslation()

  const [selectedModelName, setSelectedModelName] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [inputTokens, setInputTokens] = useState<string>('')
  const [outputTokens, setOutputTokens] = useState<string>('')
  const [requests, setRequests] = useState<string>('')

  const selectedModel = useMemo<PricingModel | null>(
    () =>
      selectedModelName
        ? models.find((m) => m.model_name === selectedModelName) || null
        : null,
    [models, selectedModelName]
  )

  const availableGroups = useMemo<string[]>(() => {
    if (!selectedModel) return []
    const enableGroups = Array.isArray(selectedModel.enable_groups)
      ? selectedModel.enable_groups
      : []
    return enableGroups.filter((g) => !EXCLUDED_GROUPS.includes(g))
  }, [selectedModel])

  const perRequest = selectedModel?.quota_type === 1
  const dynamic = selectedModel ? isDynamicPricingModel(selectedModel) : false

  const breakdown = useMemo(() => {
    if (!selectedModel) return null
    const group =
      selectedGroup && availableGroups.includes(selectedGroup)
        ? selectedGroup
        : undefined
    return computeEstimate({
      model: selectedModel,
      group,
      inputTokens: Math.max(Number(inputTokens) || 0, 0),
      outputTokens: Math.max(Number(outputTokens) || 0, 0),
      requests: perRequest
        ? Math.max(Number(requests) || 1, 1)
        : Math.max(Number(requests) || 0, 0),
      showRechargePrice,
      priceRate,
      usdExchangeRate,
    })
  }, [
    selectedModel,
    selectedGroup,
    availableGroups,
    perRequest,
    inputTokens,
    outputTokens,
    requests,
    showRechargePrice,
    priceRate,
    usdExchangeRate,
  ])

  const formatAmount = (value: number) =>
    formatBillingCurrencyFromUSD(value, {
      digitsLarge: 4,
      digitsSmall: 6,
      abbreviate: false,
    })

  const formatTokenUnit = (value: number) =>
    formatBillingCurrencyFromUSD(value / TOKEN_UNIT_DIVISORS[tokenUnit], {
      digitsLarge: 4,
      digitsSmall: 6,
      abbreviate: false,
    })

  const tokenUnitLabel = tokenUnit === 'K' ? t('/ 1K tokens') : t('/ 1M tokens')

  return (
    <section className='brand-card p-5 sm:p-6'>
      <div className='mb-4'>
        <h2 className='text-lg leading-tight font-semibold'>
          {t('Price Calculator')}
        </h2>
        <p className='text-muted-foreground mt-1 text-sm'>
          {t('Estimate the cost of a request by model and token usage.')}
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <label
            htmlFor='calculator-model'
            className='text-muted-foreground text-sm font-medium'
          >
            {t('Select a model')}
          </label>
          <select
            id='calculator-model'
            value={selectedModelName}
            onChange={(e) => {
              setSelectedModelName(e.target.value)
              setSelectedGroup('')
            }}
            className='text-foreground focus-visible:border-ring border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none'
          >
            <option value=''>{t('Select a model')}</option>
            {models.map((m) => (
              <option key={m.id} value={m.model_name}>
                {m.model_name}
              </option>
            ))}
          </select>

          {selectedModel && (
            <div className='mt-1 flex flex-wrap items-center gap-2'>
              <span className='brand-tag brand-tag-purple'>
                {perRequest ? t('Per Request') : t('Token-based')}
              </span>
              {dynamic && (
                <span className='brand-tag brand-tag-amber'>
                  {t('Tiered Pricing')}
                </span>
              )}
            </div>
          )}
        </div>

        {selectedModel && availableGroups.length > 0 && (
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='calculator-group'
              className='text-muted-foreground text-sm font-medium'
            >
              {t('Select group')}
            </label>
            <select
              id='calculator-group'
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className='text-foreground focus-visible:border-ring border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none'
            >
              <option value=''>{t('Select group')}</option>
              {availableGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedModel && (
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {perRequest ? (
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='calculator-requests'
                className='text-muted-foreground text-sm font-medium'
              >
                {t('Requests')}
              </label>
              <input
                id='calculator-requests'
                type='number'
                min={1}
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
                onBlur={(e) =>
                  setRequests(normalizeMinimumValue(e.target.value, 1))
                }
                placeholder='1'
                className='text-foreground focus-visible:border-ring border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none'
              />
            </div>
          ) : (
            <>
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='calculator-input'
                  className='text-muted-foreground text-sm font-medium'
                >
                  {t('Input tokens')}
                </label>
                <input
                  id='calculator-input'
                  type='number'
                  min={0}
                  value={inputTokens}
                  onChange={(e) => setInputTokens(e.target.value)}
                  onBlur={(e) =>
                    setInputTokens(normalizeMinimumValue(e.target.value, 0))
                  }
                  placeholder='0'
                  className='text-foreground focus-visible:border-ring border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='calculator-output'
                  className='text-muted-foreground text-sm font-medium'
                >
                  {t('Output tokens')}
                </label>
                <input
                  id='calculator-output'
                  type='number'
                  min={0}
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(e.target.value)}
                  onBlur={(e) =>
                    setOutputTokens(normalizeMinimumValue(e.target.value, 0))
                  }
                  placeholder='0'
                  className='text-foreground focus-visible:border-ring border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none'
                />
              </div>
            </>
          )}
        </div>
      )}

      {selectedModel && breakdown && (
        <div className='border-border bg-muted/30 mt-5 rounded-md border p-4'>
          <div className='flex items-center justify-between gap-3'>
            <span className='text-muted-foreground text-sm font-medium'>
              {t('Estimated cost')}
            </span>
            {showRechargePrice && (
              <span className='brand-tag brand-tag-gray'>
                {t('Recharge price')}
              </span>
            )}
          </div>
          <p className='mt-1 text-2xl font-bold'>
            {formatAmount(breakdown.totalCostUSD)}
          </p>

          <div className='text-muted-foreground mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs'>
            {perRequest ? (
              <span>
                {t('Per request')}:{' '}
                <span className='text-foreground'>
                  {formatAmount(breakdown.unitPerRequest)}
                </span>
              </span>
            ) : (
              <>
                <span>
                  {t('Input')}:{' '}
                  <span className='text-foreground'>
                    {formatTokenUnit(breakdown.inputUnitPerMillion)}
                  </span>{' '}
                  <span>{tokenUnitLabel}</span>
                </span>
                <span>
                  {t('Output')}:{' '}
                  <span className='text-foreground'>
                    {formatTokenUnit(breakdown.outputUnitPerMillion)}
                  </span>{' '}
                  <span>{tokenUnitLabel}</span>
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
