import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Queuepon — Restaurant Growth Platform',
  description: 'Done-for-you Facebook and Instagram ads that turn local foot traffic into loyal customers — all on autopilot.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'),
  openGraph: {
    title: 'Queuepon — Restaurant Growth Platform',
    description: 'Automated offers, email sequences, and Meta ads — running on autopilot for your restaurant.',
    url: 'https://queuepon.com',
    siteName: 'Queuepon',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
