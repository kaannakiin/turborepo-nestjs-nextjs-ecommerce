/** @type {import('next').NextConfig} */

// eslint-disable-next-line no-undef
const envDomains = process.env.ALLOWED_IMAGE_DOMAINS || "";

const dynamicRemotePatterns = envDomains
  .split(",")
  .map((domain) => {
    const cleanDomain = domain.trim();
    if (!cleanDomain) return null;

    let hostname = cleanDomain;
    if (cleanDomain.startsWith("http")) {
      try {
        hostname = new URL(cleanDomain).hostname;
      } catch (e) {
        return null;
      }
    }

    return {
      protocol: "https",
      hostname: hostname,
      port: "",
      pathname: "/**",
    };
  })
  .filter(Boolean);

const nextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  transpilePackages: ["@repo/database"],
  serverExternalPackages: ["@prisma/client", "pg"],
  images: {
    remotePatterns: [...dynamicRemotePatterns],
  },
};

export default nextConfig;
