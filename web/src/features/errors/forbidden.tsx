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
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function ForbiddenError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='bg-background text-foreground relative h-svh overflow-hidden'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-70'
        style={{
          background:
            'radial-gradient(50% 40% at 50% 42%, rgba(232,163,61,0.16) 0%, transparent 70%)',
        }}
      />
      <div className='relative z-10 m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>{t('Access Forbidden')}</span>
        <p className='text-muted-foreground text-center'>
          {t("You don't have necessary permission")} <br />
          {t('to view this resource.')}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button
            variant='outline'
            className='text-primary border-[rgba(232,163,61,0.4)] hover:bg-[rgba(232,163,61,0.1)]'
            onClick={() => history.go(-1)}
          >
            {t('Go Back')}
          </Button>
          <Button className='' onClick={() => navigate({ to: '/' })}>
            {t('Back to Home')}
          </Button>
        </div>
      </div>
    </div>
  )
}
