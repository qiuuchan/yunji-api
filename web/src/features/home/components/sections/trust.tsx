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

export function Trust() {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 px-6 py-16 md:py-20'>
      <div className='mx-auto flex max-w-3xl flex-col items-center gap-3 text-center'>
        <AnimateInView>
          <p className='text-muted-foreground/60 text-xs font-medium tracking-widest uppercase'>
            {t('Trusted by teams building with AI')}
          </p>
        </AnimateInView>

        <AnimateInView animation='fade-up'>
          <div className='flex items-center gap-2 text-sm font-medium text-[#9d8cff]'>
            <ShieldCheck className='size-4' />
            {t('SOC 2 ready · HTTPS everywhere · we never store your prompts')}
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
