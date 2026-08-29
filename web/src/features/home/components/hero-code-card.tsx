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
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

const ENDPOINT = 'https://zhonguoyunji.com/v1/chat/completions'
const MODEL_NAME = 'gpt-5.6'

const SNIPPET = [
  `curl ${ENDPOINT} \\`,
  '  -H "Content-Type: application/json" \\',
  '  -H "Authorization: Bearer $YUNJI_API_KEY" \\',
  "  -d '{",
  `    "model": "${MODEL_NAME}",`,
  '    "messages": [{ "role": "user", "content": "Hello!" }]',
  "  }'",
].join('\n')

interface HeroCodeCardProps {
  className?: string
}

/**
 * Static, copyable curl example rendered as a plain warm card. No window
 * chrome, no tabs, no typing animation; syntax colors come from the warm
 * semantic tokens only.
 */
export function HeroCodeCard(props: HeroCodeCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current)
      }
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard?.writeText(SNIPPET).then(
      () => {
        setCopied(true)
        if (resetTimer.current !== null) {
          window.clearTimeout(resetTimer.current)
        }
        resetTimer.current = window.setTimeout(() => {
          setCopied(false)
          resetTimer.current = null
        }, 1600)
      },
      () => {
        // Clipboard unavailable (permissions/insecure context): keep the
        // snippet selectable so the user can copy it manually.
      }
    )
  }

  return (
    <div
      className={cn(
        'border-border bg-card overflow-hidden rounded-lg border text-left',
        props.className
      )}
    >
      <div className='border-border flex items-center justify-between border-b px-4 py-2'>
        <span className='text-muted-foreground font-mono text-xs tracking-wide'>
          cURL
        </span>
        <button
          type='button'
          onClick={handleCopy}
          className='text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded px-1.5 py-1 font-mono text-xs transition-colors'
        >
          {copied ? (
            <Check className='size-3.5' aria-hidden='true' />
          ) : (
            <Copy className='size-3.5' aria-hidden='true' />
          )}
          {copied ? t('Copied') : t('Copy')}
        </button>
      </div>
      <pre className='overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[1.75] md:px-5'>
        <code>
          <span className='text-foreground'>curl</span>{' '}
          <span className='text-foreground'>{ENDPOINT}</span>{' '}
          <span className='text-muted-foreground'>{'\\'}</span>
          {'\n  '}
          <span className='text-accent'>-H</span>{' '}
          <span className='text-chart-3'>
            &quot;Content-Type: application/json&quot;
          </span>{' '}
          <span className='text-muted-foreground'>{'\\'}</span>
          {'\n  '}
          <span className='text-accent'>-H</span>{' '}
          <span className='text-chart-3'>
            &quot;Authorization: Bearer $YUNJI_API_KEY&quot;
          </span>{' '}
          <span className='text-muted-foreground'>{'\\'}</span>
          {'\n  '}
          <span className='text-accent'>-d</span>{' '}
          <span className='text-muted-foreground'>&apos;{'{'}</span>
          {'\n    '}
          <span className='text-info'>&quot;model&quot;</span>
          <span className='text-muted-foreground'>: </span>
          <span className='text-chart-3'>&quot;{MODEL_NAME}&quot;</span>
          <span className='text-muted-foreground'>,</span>
          {'\n    '}
          <span className='text-info'>&quot;messages&quot;</span>
          <span className='text-muted-foreground'>: </span>
          <span className='text-muted-foreground'>[{'{'}</span>{' '}
          <span className='text-info'>&quot;role&quot;</span>
          <span className='text-muted-foreground'>: </span>
          <span className='text-chart-3'>&quot;user&quot;</span>
          <span className='text-muted-foreground'>, </span>
          <span className='text-info'>&quot;content&quot;</span>
          <span className='text-muted-foreground'>: </span>
          <span className='text-chart-3'>&quot;Hello!&quot;</span>{' '}
          <span className='text-muted-foreground'>{'}]'}</span>
          {'\n  '}
          <span className='text-muted-foreground'>{'}'}</span>
        </code>
      </pre>
    </div>
  )
}
