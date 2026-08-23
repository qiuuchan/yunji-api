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
import { MenuIcon, XIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { DocsNavItem } from '../lib/docs-nav'

type DocsTocProps = {
  items: DocsNavItem[]
  /** id of the currently active section (for highlighting) */
  activeId: string
  /** called when a TOC link is activated; receives the anchor id */
  onNavigate: (id: string) => void
  /** mobile drawer open state */
  drawerOpen: boolean
  onDrawerOpenChange: (open: boolean) => void
}

/**
 * Table of contents for the docs center.
 *
 * On desktop it renders a sticky sidebar; on mobile the same list is hidden
 * behind a toggle button and slides in as a drawer. Selecting an item scrolls
 * the matching section into view via `onNavigate` (the parent owns scrolling
 * so it can also update the active highlight).
 */
export function DocsToc({
  items,
  activeId,
  onNavigate,
  drawerOpen,
  onDrawerOpenChange,
}: DocsTocProps) {
  const { t } = useTranslation()

  const renderLink = (id: string, titleKey: string, nested = false) => {
    const isActive = activeId === id
    return (
      <a
        key={id}
        href={`#${id}`}
        data-toc-link={id}
        aria-current={isActive ? 'true' : undefined}
        onClick={(event) => {
          event.preventDefault()
          onNavigate(id)
        }}
        className={cn(
          'block rounded-md px-3 py-1.5 text-sm transition-colors',
          nested ? 'pl-6 text-[0.8125rem]' : '',
          isActive
            ? 'text-foreground bg-[rgba(110,91,255,0.12)]'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
        )}
      >
        {t(titleKey)}
      </a>
    )
  }

  const list = (
    <nav
      aria-label={t('Documentation contents')}
      className='flex flex-col gap-0.5'
    >
      {items.map((item) => (
        <div key={item.id} className='flex flex-col'>
          {renderLink(item.id, item.titleKey)}
          {item.children?.map((child) =>
            renderLink(child.id, child.titleKey, true)
          )}
        </div>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className='hidden w-60 shrink-0 lg:block'>
        <div className='sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto py-8 pr-2'>
          {list}
        </div>
      </aside>

      {/* Mobile drawer toggle */}
      <div className='lg:hidden'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='fixed right-4 bottom-4 z-40 shadow-lg'
          onClick={() => onDrawerOpenChange(true)}
          data-testid='docs-toc-toggle'
          aria-expanded={drawerOpen}
          aria-controls='docs-toc-drawer'
        >
          <MenuIcon className='size-4' />
          {t('Contents')}
        </Button>
      </div>

      {/* Mobile drawer */}
      <div
        id='docs-toc-drawer'
        role='dialog'
        aria-modal='true'
        aria-label={t('Documentation contents')}
        className={cn(
          'bg-background/98 fixed inset-0 z-50 backdrop-blur-2xl transition-all duration-300 lg:hidden',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className='flex items-center justify-between border-b border-[rgba(110,91,255,0.12)] px-6 py-4'>
          <span className='text-sm font-semibold'>
            {t('Documentation contents')}
          </span>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => onDrawerOpenChange(false)}
            aria-label={t('Close')}
          >
            <XIcon className='size-4' />
          </Button>
        </div>
        <div className='overflow-y-auto px-6 py-4'>{list}</div>
      </div>
    </>
  )
}
