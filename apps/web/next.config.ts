import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const envDomains = process.env.ALLOWED_IMAGE_DOMAINS || '';
const dynamicRemotePatterns: NextConfig['images']['remotePatterns'] = envDomains
  .split(',')
  .map((domain) => {
    const cleanDomain = domain.trim();
    if (!cleanDomain) return null;

    let hostname = cleanDomain;
    if (cleanDomain.startsWith('http')) {
      try {
        hostname = new URL(cleanDomain).hostname;
      } catch (e) {
        return null;
      }
    }

    return {
      protocol: 'https' as const,
      hostname: hostname,
      port: '',
      pathname: '/**',
    };
  })
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  transpilePackages: ['@repo/database'],
  serverExternalPackages: ['@prisma/client', 'pg'],
  images: {
    remotePatterns: [
      ...dynamicRemotePatterns,
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
};
const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl(nextConfig);
