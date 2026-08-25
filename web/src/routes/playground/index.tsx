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
import { createFileRoute, redirect } from '@tanstack/react-router'

import { Main, PublicLayout } from '@/components/layout'
import { Playground } from '@/features/playground'
import { isSidebarModuleEnabled } from '@/lib/nav-modules'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/playground/')({
  beforeLoad: () => {
    // Authenticated users still respect the sidebar module switch.
    // Anonymous visitors are always allowed (the page is public).
    const isAuthenticated = Boolean(useAuthStore.getState().auth.user)
    if (isAuthenticated && !isSidebarModuleEnabled('chat', 'playground')) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: PlaygroundPage,
})

function PlaygroundPage() {
  return (
    <PublicLayout showMainContainer={false}>
      <Main className='p-0'>
        <Playground />
      </Main>
    </PublicLayout>
  )
}
