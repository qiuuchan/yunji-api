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

import { cn } from '@/lib/utils'

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

/* 发丝线矩阵（gap-px over border token），与首页 Capabilities 同构；
 * 不用卡片盒。badge 为等宽小字类别标签（非 eyebrow 大写）。
 * 末行不满列时让最后一个条目跨列补满整行（与首页宽主项同一手法），
 * 避免出现空的发丝线格子。 */
function FeatureGrid({ items }: { items: EnterpriseFeature[] }) {
  const { t } = useTranslation()
  const lastIdx = items.length - 1
  // 末行不满列时让最后一个条目跨列补满：sm(2 列) 与 lg(3 列) 分别判断；
  // lg 无需跨列时显式回退 col-span-1，避免 sm 的跨列在 lg 带来空洞。
  const lastSpans: string[] = []
  if (items.length % 2 !== 0) {
    lastSpans.push('sm:col-span-2')
  }
  if (items.length % 3 !== 0) {
    lastSpans.push('lg:col-span-2')
  } else if (items.length % 2 !== 0) {
    lastSpans.push('lg:col-span-1')
  }
  return (
    <div className='border-border bg-border grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((item, i) => (
        <article
          key={item.titleKey}
          className={cn('bg-background p-6', i === lastIdx && lastSpans)}
        >
          <span className='text-muted-foreground font-mono text-xs'>
            {t(item.badgeKey)}
          </span>
          <h3 className='mt-3 text-base font-medium'>{t(item.titleKey)}</h3>
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
    <section className='mx-auto mt-16 w-full max-w-[1260px] md:mt-20'>
      <div className='mb-8 max-w-2xl'>
        <h2 className='text-2xl leading-[1.2] font-medium md:text-3xl'>
          {t(headingKey)}
        </h2>
        <p className='text-muted-foreground mt-3 text-[15px]'>
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
        descriptionKey='Managed cloud or self-hosted deployment, whichever fits your organization.'
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
