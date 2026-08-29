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
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { BRAND_BUSINESS_EMAIL, BRAND_CONTACT_QR_SRC } from '@/config/brand'
import { copyToClipboard } from '@/lib/copy-to-clipboard'

/**
 * Contact section for the enterprise page.
 *
 * No backend submit exists for enterprise inquiries, so instead of a fake
 * form we surface the business contact (QR code + email) and let the user
 * copy the address to their clipboard. Copy feedback is purely local state.
 */
export function EnterpriseContact() {
  const { t } = useTranslation()
  const email = BRAND_BUSINESS_EMAIL
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
      return
    }
    const ok = await copyToClipboard(email)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section
      aria-labelledby='enterprise-contact-heading'
      className='border-border bg-section mx-auto mt-16 max-w-4xl rounded-lg border p-8 text-center md:p-10'
    >
      <h2
        id='enterprise-contact-heading'
        className='text-2xl font-bold tracking-tight md:text-3xl'
      >
        {t('Talk to our team')}
      </h2>
      <p className='text-muted-foreground mx-auto mt-3 max-w-xl text-sm'>
        {t(
          'Reach out for deployment options, SLA terms, and pricing for your organization.'
        )}
      </p>

      <div className='mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <img
            src={BRAND_CONTACT_QR_SRC}
            alt={t('Scan the QR code to contact our team')}
            className='size-36 rounded-xl border border-[rgba(232,163,61,0.25)] bg-white/90 p-2'
            width={144}
            height={144}
          />
          <span className='text-muted-foreground text-xs'>
            {t('Scan to connect')}
          </span>
        </div>

        <div className='flex flex-col items-center gap-3 sm:items-start'>
          <a
            href={`mailto:${email}`}
            data-testid='enterprise-email'
            className='bg-muted/30 text-foreground rounded-lg border px-4 py-3 font-mono text-sm'
          >
            {email}
          </a>
          <Button
            type='button'
            variant='outline'
            onClick={handleCopy}
            data-testid='copy-email-button'
            aria-label={
              copied ? t('Email address copied') : t('Copy email address')
            }
          >
            {copied ? (
              <CheckIcon className='size-4' />
            ) : (
              <CopyIcon className='size-4' />
            )}
            {copied ? t('Copied!') : t('Copy email address')}
          </Button>
        </div>
      </div>
    </section>
  )
}
