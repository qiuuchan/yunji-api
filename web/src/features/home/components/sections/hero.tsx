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
import { Link } from '@tanstack/react-router'
import { ArrowRight, Building2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { BRAND_SLOGAN } from '@/config/brand'
import { cn } from '@/lib/utils'

import { HeroCodeCard } from '../hero-code-card'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

// mimo 式品牌字水印：DOM 平铺（行 × 列），奇数行错位，逐字 hover 微亮。
const WATERMARK_TEXT = 'YUNJI API'
const WATERMARK_ROWS = 10
const WATERMARK_COLS = 14
// 反相透镜半径（px）：圆内露出米白负片世界。
const LENS_RADIUS = 176

function Watermark(props: { inverted?: boolean }) {
  const rows = Array.from({ length: WATERMARK_ROWS }, (_, i) => i)
  const cols = Array.from({ length: WATERMARK_COLS }, (_, i) => i)
  return (
    <div
      aria-hidden='true'
      className='pointer-events-auto absolute inset-0 flex flex-col overflow-hidden select-none'
    >
      {rows.map((row) => (
        <div
          key={row}
          className={cn(
            'flex flex-nowrap whitespace-nowrap text-[clamp(2.25rem,3.5vw,3.25rem)] leading-[1.6] font-semibold tracking-[0.3em]',
            row % 2 === 1 && '-ml-[2em]',
            props.inverted ? 'text-[#171410]/8' : 'text-[#f0e9dc]/5'
          )}
        >
          {cols.map((col) => (
            <span
              key={col}
              className={cn(
                'mr-[0.6em] shrink-0 transition-[color,text-shadow] duration-300',
                props.inverted
                  ? 'hover:text-[#171410]/16 hover:[text-shadow:0_0_20px_rgba(23,20,16,0.1)]'
                  : 'hover:text-[#f0e9dc]/12 hover:[text-shadow:0_0_20px_rgba(240,233,220,0.08)]'
              )}
            >
              {WATERMARK_TEXT}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const heroRef = useRef<HTMLElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  // 反相透镜只在精确指针 + 未开启减少动效时启用（触屏 / reduced-motion 降级为静态水印）。
  const [lensEnabled] = useState(
    () =>
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const hero = heroRef.current
    const lens = lensRef.current
    if (!lensEnabled || !hero || !lens) return
    const rect = hero.getBoundingClientRect()
    lens.style.clipPath = `circle(${LENS_RADIUS}px at ${event.clientX - rect.left}px ${event.clientY - rect.top}px)`
    lens.style.opacity = '1'
  }

  const handleMouseLeave = () => {
    if (lensRef.current) {
      lensRef.current.style.opacity = '0'
    }
  }

  const lensCta = props.isAuthenticated ? (
    <span className='inline-flex h-10 items-center rounded-md bg-[#171410] px-5 text-sm font-medium text-[#f0e9dc]'>
      {t('Go to Dashboard')}
    </span>
  ) : (
    <>
      <span className='inline-flex h-10 items-center rounded-md bg-[#171410] px-5 text-sm font-medium text-[#f0e9dc]'>
        {t('Start for free')}
      </span>
      <span className='inline-flex h-10 items-center rounded-md border border-[#171410]/40 px-5 text-sm font-medium text-[#171410]'>
        {t('Talk to Enterprise')}
      </span>
    </>
  )

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className='relative z-10 cursor-crosshair px-6'
    >
      {/* 品牌字水印 + 中心渐隐（标题区保持干净） */}
      <Watermark />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%,var(--background)_0%,transparent_100%)]'
      />

      <div className='relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1260px] flex-col justify-center pt-24 pb-16 md:pt-28'>
        <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10'>
          {/* Left column: slogan, subcopy, dual CTA */}
          <div className='pointer-events-auto flex flex-col items-start text-left lg:col-span-7'>
            <h1 className='landing-animate-fade-up text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] font-medium text-balance'>
              {t(BRAND_SLOGAN)}
            </h1>
            <p
              className='landing-animate-fade-up text-muted-foreground mt-6 max-w-xl text-[15px] leading-relaxed md:text-base'
              style={{ animationDelay: '80ms' }}
            >
              {t(
                'One OpenAI-compatible gateway in front of every major model. Transparent per-token billing, inspectable usage logs, and no vendor lock-in.'
              )}
            </p>

            <div
              className='landing-animate-fade-up mt-9 flex flex-wrap items-center gap-3'
              style={{ animationDelay: '160ms' }}
            >
              {props.isAuthenticated ? (
                <Button
                  className='group h-10 rounded-md px-5'
                  render={<Link to='/dashboard' />}
                >
                  {t('Go to Dashboard')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
              ) : (
                <>
                  <Button
                    className='group h-10 rounded-md px-5'
                    render={<Link to='/register' />}
                  >
                    {t('Start for free')}
                    <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                  </Button>
                  <Button
                    variant='outline'
                    className='h-10 rounded-md px-5'
                    render={<Link to='/enterprise' />}
                  >
                    <Building2 className='mr-1.5 size-4' />
                    {t('Talk to Enterprise')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right column (lg+): real, copyable curl example */}
          <div className='pointer-events-auto hidden lg:col-span-5 lg:block'>
            <div
              className='landing-animate-fade-up'
              style={{ animationDelay: '240ms' }}
            >
              <HeroCodeCard />
            </div>
          </div>
        </div>
      </div>

      {/* 反相透镜：跟随鼠标的米白负片层（水印/文案/按钮的反相副本） */}
      {lensEnabled && (
        <div
          ref={lensRef}
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300'
          style={{ clipPath: 'circle(0px at -400px -400px)' }}
        >
          <div className='absolute inset-0 bg-[#f0e9dc]'>
            <Watermark inverted />
            <div
              aria-hidden='true'
              className='absolute inset-0 bg-[radial-gradient(45%_40%,rgba(23,20,16,0.5)_0%,transparent_100%)]'
            />
            <div className='mx-auto flex h-full w-full max-w-[1260px] flex-col justify-center pt-24 pb-16 md:pt-28'>
              <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10'>
                <div className='flex flex-col items-start text-left lg:col-span-7'>
                  <p className='text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] font-medium text-balance text-[#171410]'>
                    {t(BRAND_SLOGAN)}
                  </p>
                  <p className='mt-6 max-w-xl text-[15px] leading-relaxed text-[#171410]/70 md:text-base'>
                    {t(
                      'One OpenAI-compatible gateway in front of every major model. Transparent per-token billing, inspectable usage logs, and no vendor lock-in.'
                    )}
                  </p>
                  <div className='mt-9 flex flex-wrap items-center gap-3'>
                    {lensCta}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
