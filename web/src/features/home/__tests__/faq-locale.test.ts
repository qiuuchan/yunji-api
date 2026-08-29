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

import en from '@/i18n/locales/en.json'
import fr from '@/i18n/locales/fr.json'
import ja from '@/i18n/locales/ja.json'
import ru from '@/i18n/locales/ru.json'
import vi from '@/i18n/locales/vi.json'
import zhTW from '@/i18n/locales/zh-TW.json'
import zh from '@/i18n/locales/zh.json'

const FAQ_KEYS = [
  'faq.howToStart',
  'faq.modelsSupported',
  'faq.billing',
  'faq.compatibility',
  'faq.security',
  'faq.selfHost',
] as const

const locales = { en, zh, zhTW, fr, ru, ja, vi }

describe('home FAQ locale contract', () => {
  test('provides a non-key question and answer for every supported locale', () => {
    for (const [locale, resource] of Object.entries(locales)) {
      for (const key of FAQ_KEYS) {
        const question = resource.translation[`${key}.question`]
        const answer = resource.translation[`${key}.answer`]

        expect(question, `${locale} ${key} question`).toBeTruthy()
        expect(answer, `${locale} ${key} answer`).toBeTruthy()
        expect(question, `${locale} ${key} question key leak`).not.toBe(
          `${key}.question`
        )
        expect(answer, `${locale} ${key} answer key leak`).not.toBe(
          `${key}.answer`
        )
      }
    }
  })
})
