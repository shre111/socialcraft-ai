import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SocialCraft AI — Multilingual Caption Generator',
  description:
    'Generate viral social media captions in 7 Indian & global languages with AI-powered personalization.',
  openGraph: {
    title: 'SocialCraft AI',
    description: 'AI-powered multilingual social media caption generator',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
