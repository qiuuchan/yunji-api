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
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { getPublicModels } from '../../api'

/**
 * Hairline fact strip replacing the old animated stats band. The live model
 * count comes from the public models endpoint; when the fetch fails or is
 * still loading, the number is silently omitted and only the label renders.
 * No invented numbers.
 */
export function FactStrip() {
  const { t } = useTranslation()
  const { data: models } = useQuery({
    queryKey: ['public-models'],
    queryFn: getPublicModels,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
  const modelCount = models?.length

  return (
    <div className='border-border relative z-10 border-y'>
      <div className='mx-auto grid max-w-[1260px] grid-cols-2 gap-x-8 gap-y-6 px-6 py-8 md:grid-cols-4 md:py-10'>
        <div className='flex flex-col gap-1'>
          <span className='text-foreground font-mono text-lg'>
            {t('OpenAI')}
          </span>
          <span className='text-muted-foreground text-xs'>
            {t('compatible API endpoint')}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          {modelCount !== undefined && (
            <span className='text-foreground font-mono text-lg tabular-nums'>
              {modelCount}
            </span>
          )}
          <span className='text-muted-foreground text-xs'>
            {t('live models in production')}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-foreground font-mono text-lg'>
            {t('Pay-as-you-go')}
          </span>
          <span className='text-muted-foreground text-xs'>
            {t('per-token billing')}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-foreground font-mono text-lg'>
            {t('Open source')}
          </span>
          <span className='text-muted-foreground text-xs'>
            {t('auditable under AGPL')}
          </span>
        </div>
      </div>
    </div>
  )
}
