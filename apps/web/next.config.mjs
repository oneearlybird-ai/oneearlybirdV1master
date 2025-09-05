/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // oneearlybird.com -> oneearlybird.ai
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'oneearlybird.com' }],
        destination: 'https://oneearlybird.ai/:path*',
        permanent: true,
      },
      // www.oneearlybird.com -> oneearlybird.ai
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.oneearlybird.com' }],
        destination: 'https://oneearlybird.ai/:path*',
        permanent: true,
      },
      // www.oneearlybird.ai -> oneearlybird.ai (apex)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.oneearlybird.ai' }],
        destination: 'https://oneearlybird.ai/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
