/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  basePath: "/typetastic",
  assetPrefix: "/typetastic/",
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;