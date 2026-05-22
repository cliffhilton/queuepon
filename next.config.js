/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Needed for Stripe webhook raw body verification
  async headers() {
    return [
      {
        source: '/api/webhooks/stripe',
        headers: [{ key: 'content-type', value: 'application/json' }],
      },
    ]
  },
}

module.exports = nextConfig
