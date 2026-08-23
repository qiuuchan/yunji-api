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
import { Code2, Plug, Radio } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

const SDK_LANGUAGES = ['Python', 'Node.js', 'Go', 'cURL', 'Java'] as const

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      num: '1',
      title: t('Connect'),
      desc: t(
        'Add your API keys, configure upstream channels and set access permissions in minutes.'
      ),
      icon: <Plug className='size-6' strokeWidth={1.5} />,
    },
    {
      num: '2',
      title: t('Integrate'),
      desc: t(
        'Call any model through the standard OpenAI-compatible API from your favorite SDK.'
      ),
      icon: <Code2 className='size-6' strokeWidth={1.5} />,
    },
    {
      num: '3',
      title: t('Observe'),
      desc: t(
        'Track usage, cost and latency in real time with built-in analytics and logs.'
      ),
      icon: <Radio className='size-6' strokeWidth={1.5} />,
    },
  ]

  return (
    <section className='border-border/40 relative z-10 border-t px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 text-center md:mb-20'>
          <p className='mb-3 text-xs font-medium tracking-widest text-[#9d8cff] uppercase'>
            {t('How It Works')}
          </p>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('Three steps to get started')}
          </h2>
        </AnimateInView>

        <div className='grid gap-8 md:grid-cols-3 md:gap-12'>
          {steps.map((step, i) => (
            <AnimateInView
              key={step.num}
              delay={i * 150}
              animation='fade-up'
              className='relative flex flex-col items-center text-center'
            >
              <div className='relative mb-6'>
                <div className='border-border/50 bg-muted/30 flex size-16 items-center justify-center rounded-2xl border transition-colors'>
                  {step.icon}
                </div>
                <div className='absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-[#6e5bff] text-xs font-bold text-white'>
                  {step.num}
                </div>
              </div>
              <h3 className='mb-2 text-base font-semibold'>{step.title}</h3>
              <p className='text-muted-foreground max-w-[240px] text-sm leading-relaxed'>
                {step.desc}
              </p>
            </AnimateInView>
          ))}
        </div>

        <AnimateInView
          animation='fade-up'
          className='mt-14 flex flex-col items-center gap-4'
        >
          <p className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
            {t('Official SDKs')}
          </p>
          <div className='flex flex-wrap items-center justify-center gap-2.5'>
            {SDK_LANGUAGES.map((lang) => (
              <span
                key={lang}
                className='border-border/50 bg-muted/20 text-foreground/80 font-cyber-mono rounded-lg border px-3.5 py-1.5 text-xs'
              >
                {lang}
              </span>
            ))}
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
