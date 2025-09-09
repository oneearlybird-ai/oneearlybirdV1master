/** SVP-081 hard reset: no redirects, no middleware assumptions */
const config = {

  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=(), encrypted-media=(), fullscreen=(), payment=(), usb=(), xr-spatial-tracking=(), picture-in-picture=(), publickey-credentials-get=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
    }];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { typedRoutes: true }
};
export default config;
