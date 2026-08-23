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
import { BarChart3, Building2, GitBranch, Network, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

interface FeaturesProps {
  className?: string
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Model Relay': <Network className='size-5' strokeWidth={1.5} />,
  'Smart Routing': <GitBranch className='size-5' strokeWidth={1.5} />,
  'Usage Monitoring': <BarChart3 className='size-5' strokeWidth={1.5} />,
  'Team Collaboration': <Users className='size-5' strokeWidth={1.5} />,
  'Enterprise Plan': <Building2 className='size-5' strokeWidth={1.5} />,
}

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      title: t('Model Relay'),
      desc: t(
        'Access 100+ models through one OpenAI-compatible endpoint — no vendor lock-in.'
      ),
    },
    {
      title: t('Smart Routing'),
      desc: t(
        'Automatic load balancing, failover and rate limiting across upstream channels.'
      ),
    },
    {
      title: t('Usage Monitoring'),
      desc: t(
        'Real-time dashboards for traffic, cost and token consumption per user or key.'
      ),
    },
    {
      title: t('Team Collaboration'),
      desc: t(
        'Invite members, assign roles and allocate quotas with fine-grained permissions.'
      ),
    },
    {
      title: t('Enterprise Plan'),
      desc: t(
        'Private deployment, SLA support and dedicated channels for mission-critical workloads.'
      ),
    },
  ]

  return (
    <section className='relative z-10 px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 max-w-lg'>
          <p className='mb-3 text-xs font-medium tracking-widest text-[#9d8cff] uppercase'>
            {t('Product Matrix')}
          </p>
          <h2 className='text-2xl leading-tight font-bold tracking-tight md:text-3xl'>
            {t('Everything you need to')}
            <br />
            <span className='brand-gradient-text'>
              {t('ship AI to production')}
            </span>
          </h2>
        </AnimateInView>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((f, i) => (
            <AnimateInView
              key={f.title}
              delay={(i % 3) * 100}
              animation='scale-in'
              className='brand-card group flex flex-col p-7'
            >
              <div className='text-foreground/80 border-border/50 bg-muted/30 mb-5 flex size-12 items-center justify-center rounded-xl border transition-colors group-hover:text-[#9d8cff]'>
                {FEATURE_ICONS[f.title] ?? <Network className='size-5' />}
              </div>
              <h3 className='mb-2 text-base font-semibold'>{f.title}</h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {f.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
