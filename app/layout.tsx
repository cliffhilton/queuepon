import type { Metadata } from 'next'
import './globals.css'

const FAVICON_URL = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/logos/queue-only-stacked-brown.png'

const OG_IMAGE = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/images/queuepon%20OG%20Image.png'

export const metadata: Metadata = {
  title: 'Queuepon — Done-for-you Facebook & Instagram ads for local restaurants',
  description: 'Your next customer is already on Facebook. We go get them. Done-for-you Meta ad campaigns, custom landing pages, and automated email sequences — all live within 24 hours.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'),
  icons: {
    icon:      FAVICON_URL,
    shortcut:  FAVICON_URL,
    apple:     FAVICON_URL,
  },
  openGraph: {
    title: 'Queuepon — Done-for-you Facebook & Instagram ads for local restaurants',
    description: 'Your next customer is already on Facebook. We go get them.',
    url: 'https://queuepon.com',
    siteName: 'Queuepon',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Queuepon — Done-for-you Facebook & Instagram ads for local restaurants' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queuepon — Done-for-you Facebook & Instagram ads for local restaurants',
    description: 'Your next customer is already on Facebook. We go get them.',
    images: [OG_IMAGE],
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
