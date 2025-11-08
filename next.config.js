/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove the experimental optimizeCss option for now
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
    env: {
      SITE_URL: process.env.SITE_URL || 'https://yourdomain.com',
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            }
          ],
        },
        {
          source: '/:all*(svg|jpg|png|webp|ico)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            }
          ],
        },
      ]
    },
  }
  
  module.exports = nextConfig