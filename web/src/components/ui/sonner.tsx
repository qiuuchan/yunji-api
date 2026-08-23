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
'use client'

import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { useTheme } from '@/context/theme-provider'

const Toaster = (props: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      className='toaster group'
      icons={{
        success: (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            className='size-4'
          />
        ),
        info: (
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            className='size-4'
          />
        ),
        warning: (
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2}
            className='size-4'
          />
        ),
        error: (
          <HugeiconsIcon
            icon={MultiplicationSignCircleIcon}
            strokeWidth={2}
            className='size-4'
          />
        ),
        loading: (
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className='size-4 animate-spin'
          />
        ),
      }}
      style={
        {
          '--normal-bg': 'rgba(14,14,22,0.92)',
          '--normal-text': 'var(--cyber-text)',
          '--normal-border': 'rgba(110,91,255,0.18)',
          '--success-bg': 'rgba(14,14,22,0.92)',
          '--success-border': 'rgba(57,255,136,0.45)',
          '--success-text': 'var(--cyber-green)',
          '--info-bg': 'rgba(14,14,22,0.92)',
          '--info-border': 'rgba(110,91,255,0.45)',
          '--info-text': 'var(--cyber-cyan)',
          '--warning-bg': 'rgba(14,14,22,0.92)',
          '--warning-border': 'rgba(255,179,71,0.45)',
          '--warning-text': 'var(--cyber-amber)',
          '--error-bg': 'rgba(14,14,22,0.92)',
          '--error-border': 'rgba(255,46,136,0.45)',
          '--error-text': 'var(--cyber-pink)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[rgba(14,14,22,0.92)] group-[.toaster]:text-foreground group-[.toaster]:border-[rgba(110,91,255,0.18)] group-[.toaster]:backdrop-blur-xl group-[.toaster]:shadow-[0_0_24px_rgba(110,91,255,0.08)] group-[.toaster]:rounded-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:shadow-[0_0_12px_rgba(110,91,255,0.4)]',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'group-[.toaster]:border-[rgba(57,255,136,0.45)]',
          error: 'group-[.toaster]:border-[rgba(255,46,136,0.45)]',
          warning: 'group-[.toaster]:border-[rgba(255,179,71,0.45)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
