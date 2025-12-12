import type { MetadataRoute } from "next";

const ALLOW_INDEXING = false;

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!ALLOW_INDEXING) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const disAllowPaths: string[] = [
    "/admin/",
    "/dashboard/",
    "/api/",
    "/cart/",
    "/checkout/",
    "/order/",
  ];

  return {
    rules: {
      userAgent: "*",
      disallow: disAllowPaths,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
