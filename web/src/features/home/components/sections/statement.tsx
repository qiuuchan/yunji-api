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
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { BRAND_NAME } from '@/config/brand'

/**
 * Quiet closing statement on the warm section panel: plain, verifiable
 * facts only (no SOC 2 claims, no performative trust copy).
 */
export function Statement() {
  const { t } = useTranslation()

  return (
    <section className='bg-section relative z-10 px-6 py-24 md:py-28'>
      <div className='mx-auto max-w-3xl'>
        <AnimateInView>
          <p className='text-lg leading-relaxed md:text-2xl md:leading-[1.5]'>
            <span className='text-foreground'>{BRAND_NAME}</span>{' '}
            {t(
              'runs on open-source software; traffic is encrypted in transit, usage is logged per request for your account to inspect, and billing follows the published per-token rates.'
            )}
          </p>
        </AnimateInView>
      </div>
    </section>
  )
}
