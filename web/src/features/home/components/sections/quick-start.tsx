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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

/**
 * Three action steps with plain mono numbering (no badges) and a single
 * flat SDK sentence instead of the old pill row.
 */
export function QuickStart() {
  const { t } = useTranslation()

  const steps = [
    {
      num: '01',
      title: t('Create your key'),
      desc: t('Register, then generate an API key from the console.'),
      docLink: false,
    },
    {
      num: '02',
      title: t('Send a request'),
      desc: t(
        'Point your OpenAI SDK at the gateway, or copy the curl example above.'
      ),
      docLink: true,
    },
    {
      num: '03',
      title: t('Watch usage'),
      desc: t(
        'Tokens, latency and spend per request, itemized in your dashboard.'
      ),
      docLink: false,
    },
  ]

  return (
    <section className='border-border relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-[1260px]'>
        <AnimateInView className='mb-14 max-w-2xl'>
          <h2 className='text-3xl leading-[1.15] font-medium md:text-4xl'>
            {t('Up and running in three steps')}
          </h2>
          <p className='text-muted-foreground mt-4 text-[15px]'>
            {t('Bring the client you already have.')}
          </p>
        </AnimateInView>

        <div className='grid gap-10 md:grid-cols-3 md:gap-8'>
          {steps.map((step, i) => (
            <AnimateInView key={step.num} delay={i * 100} className='max-w-sm'>
              <span className='text-accent font-mono text-sm'>{step.num}</span>
              <h3 className='mt-3 text-base font-medium'>{step.title}</h3>
              <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                {step.desc}
              </p>
              {step.docLink && (
                <Link
                  to='/docs'
                  className='hover:text-accent mt-3 inline-block text-sm underline-offset-4 hover:underline'
                >
                  {t('View documentation')}
                </Link>
              )}
            </AnimateInView>
          ))}
        </div>

        <AnimateInView
          animation='fade-in'
          className='border-border mt-14 border-t pt-6'
        >
          <p className='text-muted-foreground text-sm'>
            {t(
              'Works with the OpenAI SDK for Python and Node, or any HTTP client.'
            )}
          </p>
        </AnimateInView>
      </div>
    </section>
  )
}
