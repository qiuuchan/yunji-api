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

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'

import { EnterpriseContact } from './components/enterprise-contact'
import { EnterpriseSections } from './components/enterprise-sections'

function EnterpriseHero() {
  const { t } = useTranslation()
  return (
    <section className='mx-auto w-full max-w-[1260px] pt-14 md:pt-20'>
      <div className='max-w-2xl'>
        <h1 className='text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.15] font-medium'>
          {t('Enterprise-grade AI infrastructure for your organization')}
        </h1>
        <p className='text-muted-foreground mt-5 text-[15px] leading-relaxed md:text-base'>
          {t(
            'Reliable, secure, and scalable access to leading models through a single OpenAI-compatible API.'
          )}
        </p>
        <div className='mt-8 flex flex-wrap items-center gap-3'>
          <Button render={<Link to='/docs' />} className='h-10 rounded-md px-5'>
            {t('View documentation')}
          </Button>
          <Button
            render={<Link to='/pricing' />}
            variant='outline'
            className='h-10 rounded-md px-5'
          >
            {t('View pricing')}
          </Button>
        </div>
      </div>
    </section>
  )
}

export function Enterprise() {
  return (
    <PublicLayout>
      <EnterpriseHero />
      <EnterpriseSections />
      <EnterpriseContact />
    </PublicLayout>
  )
}
