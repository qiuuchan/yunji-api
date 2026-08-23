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
/**
 * Table-of-contents definition for the documentation center.
 *
 * `id` is the in-page anchor target (must match the `id` rendered by
 * `DocsContent`). `titleKey` is an i18n key resolved via `t()`.
 */
export type DocsNavItem = {
  id: string
  titleKey: string
  /** Optional child anchors rendered as a nested list */
  children?: { id: string; titleKey: string }[]
}

export const DOCS_NAV: DocsNavItem[] = [
  { id: 'quick-start', titleKey: 'Quick start' },
  { id: 'authentication', titleKey: 'Authentication' },
  {
    id: 'api-reference',
    titleKey: 'API reference',
    children: [
      { id: 'chat-completions', titleKey: 'Chat completions' },
      { id: 'models', titleKey: 'List models' },
      { id: 'embeddings', titleKey: 'Embeddings' },
    ],
  },
  { id: 'error-codes', titleKey: 'Error codes' },
  { id: 'sdks', titleKey: 'SDK examples' },
  { id: 'best-practices', titleKey: 'Best practices' },
  { id: 'faq', titleKey: 'FAQ' },
]
