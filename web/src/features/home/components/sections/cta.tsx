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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

/** Quiet closing CTA: one heading, one primary button, one text link. */
export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 px-6 py-24 md:py-32'>
      <AnimateInView className='mx-auto max-w-2xl text-center'>
        <h2 className='text-3xl leading-[1.15] font-medium md:text-4xl'>
          {t('Create an account and send your first request')}
        </h2>
        <div className='mt-9 flex flex-wrap items-center justify-center gap-4'>
          {props.isAuthenticated ? (
            <Button
              className='group h-10 rounded-md px-5'
              render={<Link to='/dashboard' />}
            >
              {t('Go to Dashboard')}
              <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          ) : (
            <>
              <Button
                className='group h-10 rounded-md px-5'
                render={<Link to='/register' />}
              >
                {t('Start for free')}
                <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
              <Link
                to='/enterprise'
                className='text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline'
              >
                {t('Talk to Enterprise')}
              </Link>
            </>
          )}
        </div>
      </AnimateInView>
    </section>
  )
}
