/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    mdxRs: false
  }
};

export default nextConfig;
