/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [new URL(`https://cdn.wellnessclubbyoyku.com/**`)],
  },
};

export default nextConfig;
