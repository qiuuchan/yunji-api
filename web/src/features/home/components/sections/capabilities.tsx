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
import { Coins, KeyRound, ListChecks, Wallet, Waypoints } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

/**
 * Asymmetric capability matrix: one wide primary entry plus four entries,
 * separated by hairlines (gap-px over the border token) instead of card
 * boxes.
 */
export function Capabilities() {
  const { t } = useTranslation()

  const items = [
    {
      icon: (
        <KeyRound
          className='text-muted-foreground mb-5 size-5'
          strokeWidth={1.5}
          aria-hidden='true'
        />
      ),
      title: t('Issue scoped keys'),
      desc: t(
        'Create keys with quotas, expiry and model scoping, and revoke any of them in one click.'
      ),
    },
    {
      icon: (
        <ListChecks
          className='text-muted-foreground mb-5 size-5'
          strokeWidth={1.5}
          aria-hidden='true'
        />
      ),
      title: t('Inspect every call'),
      desc: t(
        'Per-request logs capture tokens, latency and cost, visible to your account in real time.'
      ),
    },
    {
      icon: (
        <Wallet
          className='text-muted-foreground mb-5 size-5'
          strokeWidth={1.5}
          aria-hidden='true'
        />
      ),
      title: t('Cap your spending'),
      desc: t(
        'Set budgets per user, key or model; balances deduct in real time and alert before they run dry.'
      ),
    },
    {
      icon: (
        <Coins
          className='text-muted-foreground mb-5 size-5'
          strokeWidth={1.5}
          aria-hidden='true'
        />
      ),
      title: t('Pay only for what you use'),
      desc: t(
        'Published per-token rates with no minimums or subscriptions; the bill is simply the sum of your calls.'
      ),
    },
  ]

  return (
    <section className='relative z-10 px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-[1260px]'>
        <AnimateInView className='mb-14 max-w-2xl'>
          <h2 className='text-3xl leading-[1.15] font-medium md:text-4xl'>
            {t('A gateway built for production traffic')}
          </h2>
          <p className='text-muted-foreground mt-4 text-[15px] leading-relaxed'>
            {t(
              'Routing, quotas, logging and billing that hold up under real load.'
            )}
          </p>
        </AnimateInView>

        <div className='border-border bg-border grid gap-px overflow-hidden rounded-lg border lg:grid-cols-2'>
          <AnimateInView
            animation='fade-in'
            className='bg-background flex flex-col justify-center p-8 md:p-10 lg:row-span-2'
          >
            <Waypoints
              className='text-muted-foreground mb-6 size-6'
              strokeWidth={1.5}
              aria-hidden='true'
            />
            <h3 className='text-xl font-medium'>
              {t('Route across providers')}
            </h3>
            <p className='text-muted-foreground mt-3 max-w-md text-[15px] leading-relaxed'>
              {t(
                'Requests load-balance and fail over across upstream channels automatically, so one slow or failing provider never takes the endpoint down.'
              )}
            </p>
          </AnimateInView>

          {items.map((item) => (
            <AnimateInView
              key={item.title}
              animation='fade-in'
              className='bg-background p-8'
            >
              {item.icon}
              <h3 className='text-base font-medium'>{item.title}</h3>
              <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
                {item.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
