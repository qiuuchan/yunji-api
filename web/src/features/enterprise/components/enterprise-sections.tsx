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

import {
  type EnterpriseFeature,
  CUSTOMER_SCENARIOS,
  DEPLOYMENT_OPTIONS,
  ENTERPRISE_PLANS,
  SECURITY_POINTS,
} from '../lib/enterprise-content'

type EnterpriseSectionProps = {
  headingKey: string
  descriptionKey: string
  items: EnterpriseFeature[]
}

function FeatureGrid({ items }: { items: EnterpriseFeature[] }) {
  const { t } = useTranslation()
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((item) => (
        <article key={item.titleKey} className='brand-card p-5'>
          <span className='brand-gradient-text text-xs font-semibold tracking-wide uppercase'>
            {t(item.badgeKey)}
          </span>
          <h3 className='mt-2 text-base font-semibold'>{t(item.titleKey)}</h3>
          <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
            {t(item.descriptionKey)}
          </p>
        </article>
      ))}
    </div>
  )
}

function EnterpriseSection({
  headingKey,
  descriptionKey,
  items,
}: EnterpriseSectionProps) {
  const { t } = useTranslation()
  return (
    <section className='mx-auto mt-14 max-w-5xl'>
      <div className='mb-6 text-center'>
        <h2 className='text-xl font-bold tracking-tight md:text-2xl'>
          {t(headingKey)}
        </h2>
        <p className='text-muted-foreground mx-auto mt-2 max-w-2xl text-sm'>
          {t(descriptionKey)}
        </p>
      </div>
      <FeatureGrid items={items} />
    </section>
  )
}

export function EnterpriseSections() {
  return (
    <>
      <EnterpriseSection
        headingKey='Enterprise plans'
        descriptionKey='Flexible plans built for scale, reliability, and control.'
        items={ENTERPRISE_PLANS}
      />
      <EnterpriseSection
        headingKey='Deployment options'
        descriptionKey='Run the way your organization needs — managed or self-hosted.'
        items={DEPLOYMENT_OPTIONS}
      />
      <EnterpriseSection
        headingKey='Security & compliance'
        descriptionKey='Designed with enterprise security requirements in mind.'
        items={SECURITY_POINTS}
      />
      <EnterpriseSection
        headingKey='Customer scenarios'
        descriptionKey='Common ways teams put the platform to work.'
        items={CUSTOMER_SCENARIOS}
      />
    </>
  )
}
