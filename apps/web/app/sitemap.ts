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

  try {
    const res = await fetch(`${backendUrl}/users/products/get-site-map`, {
      method: "GET",
      // (İsteğe bağlı) cache'lemeyi tamamen kapatmak için
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "Sitemap backend fetch failed:",
        res.status,
        res.statusText
      );
      return [...staticUrls];
    }

    const productsSitemap: MetadataRoute.Sitemap = await res.json();
    return [...staticUrls, ...productsSitemap];
  } catch (error) {
    console.error("Sitemap fetch error:", error);
    // Build anında değil de, istek anında hata olursa diye
    // en azından statik URL'leri döndür
    return [...staticUrls];
  }
}
export const dynamic = "force-dynamic";
