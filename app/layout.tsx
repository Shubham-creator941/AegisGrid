import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AegisGrid — Operational Decision Intelligence',
  description: 'Trace disruption through critical networks. Evaluate response options. Make defensible decisions.',
  generator: 'AegisGrid',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#111315',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
