import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Innexar - Technology Solutions',
  description: 'Professional technology solutions, software development, infrastructure and consulting services',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

// Root layout only passes children through - the [locale]/layout.tsx handles html/body
export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return children
}