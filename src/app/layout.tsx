import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { FloatingDocButton } from '@/shared/components/floating-doc-button'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app')
  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/favicon.svg',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="h-full min-h-screen w-full relative overflow-x-hidden bg-slate-100">
        {/* Fondo claro de pantalla completa */}
        <div className="fixed inset-0 -z-10 bg-slate-100" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <FloatingDocButton />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
