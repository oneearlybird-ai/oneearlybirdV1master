import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

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
};

export default withMDX(nextConfig);
