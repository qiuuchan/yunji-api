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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ_KEYS = [
  'faq.howToStart',
  'faq.modelsSupported',
  'faq.billing',
  'faq.routing',
  'faq.security',
  'faq.selfHost',
  'faq.enterprise',
  'faq.compatibility',
] as const

export function FAQ() {
  const { t } = useTranslation()

  return (
    <section className='border-border/40 relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-3xl'>
        <AnimateInView className='mb-12 text-center'>
          <p className='mb-3 text-xs font-medium tracking-widest text-[#9d8cff] uppercase'>
            {t('FAQ')}
          </p>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('Frequently asked questions')}
          </h2>
        </AnimateInView>

        <Accordion className='border-border/40 rounded-2xl border'>
          {FAQ_KEYS.map((key, i) => (
            <AccordionItem key={key} value={`faq-${i}`} className='px-5'>
              <AccordionTrigger>{t(`${key}.question`)}</AccordionTrigger>
              <AccordionContent>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  {t(`${key}.answer`)}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
