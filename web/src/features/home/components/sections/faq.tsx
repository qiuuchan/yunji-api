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

// Six entries, hairline separated (AccordionItem ships border-b); the old
// routing/enterprise entries moved to the dedicated pages that cover them.
const FAQ_KEYS = [
  'faq.howToStart',
  'faq.modelsSupported',
  'faq.billing',
  'faq.compatibility',
  'faq.security',
  'faq.selfHost',
] as const

export function FAQ() {
  const { t } = useTranslation()

  return (
    <section className='border-border relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-3xl'>
        <AnimateInView className='mb-12 max-w-xl'>
          <h2 className='text-3xl leading-[1.15] font-medium md:text-4xl'>
            {t('Frequently asked questions')}
          </h2>
          <p className='text-muted-foreground mt-4 text-[15px]'>
            {t('What people usually ask before switching over.')}
          </p>
        </AnimateInView>

        <Accordion>
          {FAQ_KEYS.map((key, i) => (
            <AccordionItem key={key} value={`faq-${i}`}>
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
