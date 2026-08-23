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
import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

// Placeholder partner slots — replaced with real logos when available.
// Stable keys (not array indices) keep React reconciliation correct.
const PARTNER_SLOTS = [
  'slot-1',
  'slot-2',
  'slot-3',
  'slot-4',
  'slot-5',
  'slot-6',
]

export function Trust() {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 px-6 py-20 md:py-24'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-10 text-center'>
          <p className='text-muted-foreground/60 text-xs font-medium tracking-widest uppercase'>
            {t('Trusted by teams building with AI')}
          </p>
        </AnimateInView>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6'>
          {PARTNER_SLOTS.map((slot) => (
            <div
              key={slot}
              className='border-border/40 bg-muted/15 flex h-16 items-center justify-center rounded-xl border'
              aria-hidden
            >
              <span className='text-muted-foreground/30 text-xs font-medium tracking-wide'>
                {t('Partner')}
              </span>
            </div>
          ))}
        </div>

        <AnimateInView
          animation='fade-up'
          className='mt-12 flex flex-col items-center justify-center gap-2 text-center'
        >
          <div className='flex items-center gap-2 text-sm font-medium text-[#9d8cff]'>
            <ShieldCheck className='size-4' />
            {t('SOC 2 ready · HTTPS everywhere · we never store your prompts')}
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
