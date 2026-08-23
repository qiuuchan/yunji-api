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
    <section className='mx-auto max-w-4xl pt-10 text-center md:pt-16'>
      <span className='brand-gradient-bg inline-flex rounded-full px-3 py-1 text-xs font-medium'>
        {t('For organizations')}
      </span>
      <h1 className='brand-gradient-text mt-5 text-3xl font-bold tracking-tight md:text-5xl'>
        {t('Enterprise-grade AI infrastructure for your organization')}
      </h1>
      <p className='text-muted-foreground mx-auto mt-4 max-w-2xl text-sm leading-relaxed md:text-base'>
        {t(
          'Reliable, secure, and scalable access to leading models through a single OpenAI-compatible API.'
        )}
      </p>
      <div className='mt-7 flex items-center justify-center gap-3'>
        <Button render={<Link to='/docs' />} size='lg'>
          {t('View documentation')}
        </Button>
        <Button render={<Link to='/pricing' />} size='lg' variant='outline'>
          {t('Compare plans')}
        </Button>
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
