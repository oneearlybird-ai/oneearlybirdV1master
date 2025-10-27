import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const REPORT_ONLY_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'inline-speculation-rules' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https: wss:",
  "media-src 'self' https:",
  "frame-src 'self' https://*.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];


const CSP_REPORT_ONLY_VALUE = REPORT_ONLY_DIRECTIVES.join('; ') + '; report-to csp-endpoint';

const REPORTING_HEADERS = [
  { key: "Reporting-Endpoints", value: "csp-endpoint=\"https://reports.oneearlybird.ai/csp\"" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY_VALUE },
];

const DESKTOP_ROUTES = ["/", "/pricing", "/login"];
const MOBILE_ROUTES = ["/m", "/m/login"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    mdxRs: true,
    optimizePackageImports: ["swiper", "aos"],
  },
  typedRoutes: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  async headers() {
    return [
      ...DESKTOP_ROUTES.map((route) => ({ source: route, headers: REPORTING_HEADERS })),
      ...MOBILE_ROUTES.map((route) => ({ source: route, headers: REPORTING_HEADERS })),
    ];
  },
};

export default withMDX(nextConfig);
