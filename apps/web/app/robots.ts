import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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
