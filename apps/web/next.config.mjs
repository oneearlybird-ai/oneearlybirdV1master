/** SVP-081 hard reset: no redirects, no middleware assumptions */
const config = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { typedRoutes: true }
};
export default config;
