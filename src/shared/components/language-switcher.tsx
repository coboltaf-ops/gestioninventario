'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setLocale as setLocaleAction } from '@/i18n/actions'
import type { Locale } from '@/i18n/config'

interface LanguageSwitcherProps {
  onlyLang?: Locale  // Si se especifica, renderiza solo ese botón
}

export function LanguageSwitcher({ onlyLang }: LanguageSwitcherProps = {}) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('common')

  const switchTo = (next: Locale) => {
    if (next === locale) return
    startTransition(async () => {
      await setLocaleAction(next)
      router.refresh()
    })
  }

  const baseBtn =
    'px-3 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-60 flex items-center gap-1.5'
  const active =
    'text-slate-800 bg-black/20 border border-black/30 shadow-sm'
  const inactive =
    'text-slate-600 hover:text-slate-800 hover:bg-black/10 border border-transparent'

  const btnES = (
    <button
      type="button"
      onClick={() => switchTo('es')}
      disabled={isPending}
      className={`${baseBtn} ${locale === 'es' ? active : inactive}`}
      aria-pressed={locale === 'es'}
      title="Español"
    >
      <span className="text-base leading-none">🇪🇸</span>
      <span>ES</span>
    </button>
  )

  const btnEN = (
    <button
      type="button"
      onClick={() => switchTo('en')}
      disabled={isPending}
      className={`${baseBtn} ${locale === 'en' ? active : inactive}`}
      aria-pressed={locale === 'en'}
      title="English (USA)"
    >
      <span className="text-base leading-none">🇺🇸</span>
      <span>EN</span>
    </button>
  )

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-1 rounded-lg"
      style={{
        background: 'rgba(15,23,42,0.04)',
        border: '1px solid rgba(15,23,42,0.08)',
      }}
      aria-label={t('language')}
    >
      {onlyLang === 'en' ? btnEN : onlyLang === 'es' ? btnES : (<>{btnES}{btnEN}</>)}
    </div>
  )
}
