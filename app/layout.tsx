import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { AnalyticsProvider } from '@/components/analytics-provider'

export const metadata: Metadata = {
  title: 'MakePortfolio',
  description: 'Create stunning portfolio websites in minutes',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
