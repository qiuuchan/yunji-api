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
import { useCallback, useEffect, useRef, useState } from 'react'

import { DOCS_NAV } from '../lib/docs-nav'
import { DocsContent } from './docs-content'
import { DocsToc } from './docs-toc'

/**
 * Documentation center shell.
 *
 * Owns the mobile drawer state and the active-section highlight. Selecting a
 * TOC item scrolls the matching section into view and closes the drawer; an
 * IntersectionObserver keeps the highlight in sync while the user scrolls.
 */
export function DocsShell() {
  const [activeId, setActiveId] = useState<string>(DOCS_NAV[0]?.id ?? '')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
    setDrawerOpen(false)
  }, [])

  useEffect(() => {
    const sections = DOCS_NAV.flatMap((item) =>
      [item.id, ...(item.children?.map((c) => c.id) ?? [])].map((id) =>
        document.getElementById(id)
      )
    ).filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className='mx-auto flex w-full max-w-6xl gap-8 px-4 md:px-6'
    >
      <DocsToc
        items={DOCS_NAV}
        activeId={activeId}
        onNavigate={scrollToSection}
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
      />
      <main className='min-w-0 flex-1 pb-24'>
        <DocsContent />
      </main>
    </div>
  )
}
