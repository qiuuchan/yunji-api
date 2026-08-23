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
import { createContext, useContext, useMemo, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  defaultTheme: Theme
  resolvedTheme: ResolvedTheme
  theme: Theme
  setTheme: (theme: Theme) => void
  resetTheme: () => void
}

/* 赛博雨幕主题为固定暗色，不再提供明暗切换/预设/字体轴。
 * 保留 useTheme API（resolvedTheme 恒为 'dark'），使 sonner、
 * use-chart-theme 与图表组件等消费方零改动。 */
const initialState: ThemeProviderState = {
  defaultTheme: 'dark',
  resolvedTheme: 'dark',
  theme: 'dark',
  setTheme: () => null,
  resetTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  ...props
}: ThemeProviderProps) {
  // 恒定暗色：状态仅用于满足 API 形态，行为不再随主题变化。
  const [theme] = useState<Theme>('dark')
  const [resolvedTheme] = useState<ResolvedTheme>('dark')

  const setTheme = () => null
  const resetTheme = () => null

  const contextValue = useMemo(
    () => ({
      defaultTheme,
      resolvedTheme,
      resetTheme,
      theme,
      setTheme,
    }),
    [defaultTheme, resolvedTheme, theme]
  )

  return (
    <ThemeContext value={contextValue} {...props}>
      {children}
    </ThemeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
