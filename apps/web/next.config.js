/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // eslint-disable-next-line no-undef, no-constant-binary-expression
      new URL(`${process.env.MINIO_ENDPOINT}/**` || "http://localhost:1337"),
    ],
  },
};

export default nextConfig;
