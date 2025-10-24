import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
  ];
  const res = await fetch(`${backendUrl}/users/products/get-site-map`, {
    method: "GET",
  });

  if (!res.ok) {
    return [...staticUrls];
  }

  const productsSitemap: MetadataRoute.Sitemap = await res.json();

  return [...staticUrls, ...productsSitemap];
}
