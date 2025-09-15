/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL(`https://minio-u4swkos408scoocgswcsok0o.playflexdesign.com/**`),
    ],
  },
};

export default nextConfig;
