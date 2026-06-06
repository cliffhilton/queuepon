/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
<<<<<<< HEAD
=======
  // Needed for Stripe webhook raw body verification
  async headers() {
    return [
      {
        source: '/api/webhooks/stripe',
        headers: [{ key: 'content-type', value: 'application/json' }],
      },
    ]
  },
>>>>>>> e9bcba0 (Initial commit — full Queuepon build)
}

module.exports = nextConfig
