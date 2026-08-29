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
import { DEFAULT_TOKEN_UNIT } from '../constants'
import type { PricingModel } from '../types'
import {
  getDynamicPricingSummary,
  isDynamicPricingModel,
} from './dynamic-price'
import { getDisplayGroupRatio } from './model-helpers'

// ----------------------------------------------------------------------------
// Price Calculator (pure, framework-free)
// ----------------------------------------------------------------------------

export type CalculatorParams = {
  model: PricingModel
  group?: string
  inputTokens: number
  outputTokens: number
  requests?: number
  showRechargePrice?: boolean
  priceRate?: number
  usdExchangeRate?: number
}

export type CostBreakdown = {
  dynamic: boolean
  perRequest: boolean
  inputUnitPerMillion: number // recharge-applied USD per 1M input tokens (0 if n/a)
  outputUnitPerMillion: number // recharge-applied USD per 1M output tokens (0 if n/a)
  unitPerRequest: number // recharge-applied USD per request (0 if n/a)
  inputCostUSD: number // recharge-applied USD for the input tokens entered
  outputCostUSD: number // recharge-applied USD for the output tokens entered
  totalCostUSD: number // recharge-applied USD total estimate to display
}

function safeNumber(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : 0
}

function applyRechargeRate(
  price: number,
  showWithRecharge: boolean,
  priceRate: number,
  usdExchangeRate: number
): number {
  if (!showWithRecharge) return price
  return (price * priceRate) / usdExchangeRate
}

/**
 * Compute an estimated cost for a single request given a model and usage.
 *
 * Token-based prices are PER 1,000,000 TOKENS per new-api convention.
 */
export function computeEstimate(params: CalculatorParams): CostBreakdown {
  const {
    model,
    group,
    inputTokens,
    outputTokens,
    requests,
    showRechargePrice = false,
    priceRate = 1,
    usdExchangeRate = 1,
  } = params

  const perRequest = model.quota_type === 1
  const displayGroupRatio = getDisplayGroupRatio(model, group)

  // Recharge application (replicates applyRechargeRate in price.ts)
  const apply = (price: number) =>
    applyRechargeRate(price, showRechargePrice, priceRate, usdExchangeRate)

  const safeInput = safeNumber(inputTokens)
  const safeOutput = safeNumber(outputTokens)
  const safeRequests = safeNumber(requests)

  const breakdown: CostBreakdown = {
    dynamic: false,
    perRequest,
    inputUnitPerMillion: 0,
    outputUnitPerMillion: 0,
    unitPerRequest: 0,
    inputCostUSD: 0,
    outputCostUSD: 0,
    totalCostUSD: 0,
  }

  if (perRequest) {
    const unitPerRequest = apply((model.model_price || 0) * displayGroupRatio)
    breakdown.unitPerRequest = safeNumber(unitPerRequest)
    breakdown.totalCostUSD = safeNumber(breakdown.unitPerRequest * safeRequests)
    return breakdown
  }

  if (isDynamicPricingModel(model)) {
    const summary = getDynamicPricingSummary(model, {
      tokenUnit: DEFAULT_TOKEN_UNIT,
      showRechargePrice,
      priceRate,
      usdExchangeRate,
    })

    let inputValue = 0
    let outputValue = 0

    if (summary) {
      const inputEntry = summary.primaryEntries.find(
        (entry) => entry.field === 'inputPrice'
      )
      const outputEntry = summary.primaryEntries.find(
        (entry) => entry.field === 'outputPrice'
      )
      inputValue = inputEntry?.value ?? 0
      outputValue = outputEntry?.value ?? 0
    }

    // getDynamicPricingSummary returns raw (un-recharge-applied) per-million
    // unit prices; apply the recharge rate so the estimate matches the
    // token-based branch under the recharge-price toggle.
    inputValue = apply(inputValue)
    outputValue = apply(outputValue)

    breakdown.dynamic = true
    breakdown.inputUnitPerMillion = safeNumber(inputValue)
    breakdown.outputUnitPerMillion = safeNumber(outputValue)
    breakdown.inputCostUSD = safeNumber(
      breakdown.inputUnitPerMillion * (safeInput / 1_000_000)
    )
    breakdown.outputCostUSD = safeNumber(
      breakdown.outputUnitPerMillion * (safeOutput / 1_000_000)
    )
    breakdown.totalCostUSD = safeNumber(
      breakdown.inputCostUSD + breakdown.outputCostUSD
    )
    return breakdown
  }

  const inputUnitPerMillion = apply(model.model_ratio * 2 * displayGroupRatio)
  const outputUnitPerMillion = apply(
    model.model_ratio * 2 * displayGroupRatio * model.completion_ratio
  )

  breakdown.inputUnitPerMillion = safeNumber(inputUnitPerMillion)
  breakdown.outputUnitPerMillion = safeNumber(outputUnitPerMillion)
  breakdown.inputCostUSD = safeNumber(
    breakdown.inputUnitPerMillion * (safeInput / 1_000_000)
  )
  breakdown.outputCostUSD = safeNumber(
    breakdown.outputUnitPerMillion * (safeOutput / 1_000_000)
  )
  breakdown.totalCostUSD = safeNumber(
    breakdown.inputCostUSD + breakdown.outputCostUSD
  )
  return breakdown
}
