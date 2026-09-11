import { ReactNode } from 'react'
import AppLayout from './app-layout'

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string }
}) {
  return (
    <AppLayout>{children}</AppLayout>
  )
}
