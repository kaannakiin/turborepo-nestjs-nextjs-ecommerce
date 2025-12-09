/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minio-h048sg8c8w0004sk00sgsc0g.playflexdesign.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.wellnessclubbyoyku.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "minio-y8wkos48ok800swco8osw0g8.alldemeter.tech",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
