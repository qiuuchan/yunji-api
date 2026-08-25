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

import type { PricingModel } from '../../types'
import { computeEstimate } from '../calculator'

// Minimal fake model builder — only the fields consumed by computeEstimate.
function tokenModel(overrides: Partial<PricingModel>): PricingModel {
  return {
    id: 1,
    model_name: 'test-model',
    quota_type: 0,
    model_ratio: 2,
    completion_ratio: 1.5,
    enable_groups: [],
    ...overrides,
  } as PricingModel
}

describe('computeEstimate — token-based', () => {
  test('ratio=1, no group', () => {
    const model = tokenModel({
      model_ratio: 2,
      completion_ratio: 1.5,
      quota_type: 0,
      enable_groups: [],
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
    })
    expect(r.inputUnitPerMillion).toBe(4) // 2*2*1
    expect(r.outputUnitPerMillion).toBe(6) // 4*1.5
    expect(r.inputCostUSD).toBe(4)
    expect(r.outputCostUSD).toBe(12)
    expect(r.totalCostUSD).toBe(16)
    expect(r.perRequest).toBe(false)
    expect(r.dynamic).toBe(false)
  })

  test('with group selection vip ratio=4', () => {
    const model = tokenModel({
      model_ratio: 2,
      completion_ratio: 1.5,
      enable_groups: ['default', 'vip'],
      group_ratio: { default: 1, vip: 4 },
    })
    const r = computeEstimate({
      model,
      group: 'vip',
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
    })
    expect(r.inputUnitPerMillion).toBe(16) // 2*2*4
    expect(r.outputUnitPerMillion).toBe(24) // 16*1.5
  })

  test('default group = min ratio (no group passed)', () => {
    const model = tokenModel({
      model_ratio: 2,
      completion_ratio: 1.5,
      enable_groups: ['default', 'vip'],
      group_ratio: { default: 1, vip: 4 },
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
    })
    expect(r.inputUnitPerMillion).toBe(4) // min(1,4)=1
    expect(r.outputUnitPerMillion).toBe(6)
  })

  test('recharge price applies', () => {
    const model = tokenModel({
      model_ratio: 2,
      completion_ratio: 1.5,
      enable_groups: [],
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
      showRechargePrice: true,
      priceRate: 2,
      usdExchangeRate: 8,
    })
    // base total 16 * (2/8) = 4
    expect(r.inputCostUSD).toBeCloseTo(1, 10) // 4 * 2/8
    expect(r.outputCostUSD).toBeCloseTo(3, 10) // 12 * 2/8
    expect(r.totalCostUSD).toBeCloseTo(4, 10)
    expect(r.inputUnitPerMillion).toBeCloseTo(1, 10) // 4 * 2/8
    expect(r.outputUnitPerMillion).toBeCloseTo(1.5, 10) // 6 * 2/8
  })

  test('zero tokens → total 0', () => {
    const model = tokenModel({
      model_ratio: 2,
      completion_ratio: 1.5,
      enable_groups: [],
    })
    const r = computeEstimate({
      model,
      inputTokens: 0,
      outputTokens: 0,
    })
    expect(r.totalCostUSD).toBe(0)
    expect(r.inputCostUSD).toBe(0)
    expect(r.outputCostUSD).toBe(0)
  })
})

describe('computeEstimate — per-request', () => {
  test('basic per-request', () => {
    const model = tokenModel({
      quota_type: 1,
      model_price: 0.5,
      enable_groups: [],
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
      requests: 3,
    })
    expect(r.unitPerRequest).toBe(0.5)
    expect(r.totalCostUSD).toBe(1.5) // 0.5*3
    expect(r.perRequest).toBe(true)
    expect(r.inputUnitPerMillion).toBe(0)
    expect(r.outputUnitPerMillion).toBe(0)
    expect(r.dynamic).toBe(false)
  })

  test('per-request with group ratio vip=2', () => {
    const model = tokenModel({
      quota_type: 1,
      model_price: 0.5,
      enable_groups: ['vip'],
      group_ratio: { vip: 2 },
    })
    const r = computeEstimate({
      model,
      group: 'vip',
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
      requests: 3,
    })
    expect(r.unitPerRequest).toBe(1) // 0.5*2
    expect(r.totalCostUSD).toBe(3) // 1*3
    expect(r.perRequest).toBe(true)
  })

  test('per-request with requests omitted → lib keeps pure (component defaults to 1)', () => {
    // The computeEstimate lib is pure: safeNumber(undefined requests) => 0,
    // so total = unit*0 = 0. The UI layer defaults an empty requests field to 1
    // (see pricing-calculator.tsx), so end users see the per-request unit price.
    const model = tokenModel({
      quota_type: 1,
      model_price: 0.5,
      enable_groups: [],
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 2_000_000,
    })
    expect(r.unitPerRequest).toBe(0.5)
    expect(r.totalCostUSD).toBe(0)
  })
})

describe('computeEstimate — dynamic/tiered', () => {
  test('dynamic model sets dynamic=true and yields finite non-negative total', () => {
    const model = tokenModel({
      quota_type: 0,
      billing_mode: 'tiered_expr',
      billing_expr: 'v1: tier("tier1", p*5 c*7)',
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
    })
    expect(r.dynamic).toBe(true)
    expect(r.perRequest).toBe(false)
    expect(Number.isFinite(r.totalCostUSD)).toBe(true)
    expect(r.totalCostUSD).toBeGreaterThanOrEqual(0)
    // inputPrice=5, outputPrice=7 → per-million units; 1M each → 5+7=12
    expect(r.inputUnitPerMillion).toBe(5)
    expect(r.outputUnitPerMillion).toBe(7)
    expect(r.totalCostUSD).toBe(12)
  })

  test('dynamic model with recharge rate applies', () => {
    const model = tokenModel({
      quota_type: 0,
      billing_mode: 'tiered_expr',
      billing_expr: 'v1: tier("tier1", p*5 c*7)',
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
      showRechargePrice: true,
      priceRate: 2,
      usdExchangeRate: 8,
    })
    // computeEstimate applies the recharge rate to the dynamic per-million units
    // (inputPrice=5, outputPrice=7 → base 12 * (2/8) = 3).
    expect(r.dynamic).toBe(true)
    expect(r.inputUnitPerMillion).toBeCloseTo(1.25, 10) // 5 * 2/8
    expect(r.outputUnitPerMillion).toBeCloseTo(1.75, 10) // 7 * 2/8
    expect(r.totalCostUSD).toBeCloseTo(3, 10)
  })
})

describe('computeEstimate — non-finite guards', () => {
  test('NaN inputTokens → finite 0 total', () => {
    const model = tokenModel({
      model_ratio: 2,
      completion_ratio: 1.5,
      enable_groups: [],
    })
    const r = computeEstimate({
      model,
      inputTokens: Number.NaN,
      outputTokens: Number.NaN,
    })
    expect(Number.isFinite(r.totalCostUSD)).toBe(true)
    expect(r.totalCostUSD).toBe(0)
  })

  test('NaN model_ratio → finite 0 total', () => {
    const model = tokenModel({
      model_ratio: Number.NaN,
      completion_ratio: 1.5,
      enable_groups: [],
    })
    const r = computeEstimate({
      model,
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
    })
    expect(Number.isFinite(r.totalCostUSD)).toBe(true)
    expect(r.totalCostUSD).toBe(0)
  })
})
