import { PrismaClient } from "../../generated/prisma";
import fetch from "node-fetch";
import iconv from "iconv-lite";

const prisma = new PrismaClient();

async function seedTaxonomyCategories() {
  console.log("Starting taxonomy seeding process...");

  // Önce mevcut taxonomy verilerini temizle
  await prisma.taxonomyCategory.deleteMany({});
  console.log("Cleared existing taxonomy categories");

  try {
    // Google taxonomy dosyasını fetch et
    const response = await fetch(
      "https://www.google.com/basepages/producttype/taxonomy.tr-TR.txt"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Buffer olarak al ve UTF-8'e çevir
    const buffer = await response.buffer();
    const textContent = iconv.decode(buffer, "utf8");

    console.log("Successfully fetched and decoded taxonomy file");

    // Satırlara ayır ve boş satırları, yorum satırlarını ve version bilgisini filtrele
    const lines = textContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        // Boş satırları filtrele
        if (line.length === 0) return false;
        // # ile başlayan yorum satırlarını ve version bilgisini filtrele
        if (line.startsWith("#")) return false;
        // Sadece taxonomy verilerini al (> içeren satırlar)
        return (
          line.includes(">") || !line.startsWith("Google_Product_Taxonomy")
        );
      });

    console.log(
      `Found ${lines.length} taxonomy lines to process (after filtering comments and version info)`
    );

    // Her kategori için parent-child ilişkilerini takip etmek için bir map
    const categoryMap = new Map<string, string>(); // path -> categoryId mapping

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      console.log(
        `Processing line ${index + 1}/${lines.length}: ${line.substring(0, 50)}...`
      );

      // ">" ile kategori hiyerarşisini ayır
      const categoryParts = line.split(">").map((part) => part.trim());

      // Her level için kategori oluştur
      let currentPath = "";
      let parentId: string | null = null;

      for (let depth = 0; depth < categoryParts.length; depth++) {
        const categoryName = categoryParts[depth];
        const previousPath = currentPath;
        currentPath = currentPath
          ? `${currentPath} > ${categoryName}`
          : categoryName;

        // Bu path için kategori zaten var mı kontrol et
        if (categoryMap.has(currentPath)) {
          parentId = categoryMap.get(currentPath)!;
          continue;
        }

        // Google ID'sini oluştur (basit bir hash veya index kullanabiliriz)
        const googleId = `google_${Buffer.from(currentPath).toString("base64").slice(0, 20)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Kategoriyi oluştur
        const category = await prisma.taxonomyCategory.create({
          data: {
            googleId: googleId,
            originalName: categoryName,
            path: currentPath,
            pathNames: categoryParts.slice(0, depth + 1).join(" > "),
            depth: depth,
            parentId: parentId,
            isActive: true,
          },
        });

        // Map'e ekle
        categoryMap.set(currentPath, category.id);
        parentId = category.id;

        console.log(
          `  Created category at depth ${depth}: ${categoryName} (ID: ${category.id})`
        );
      }
    }

    console.log("Taxonomy seeding completed successfully!");
    console.log(`Total categories created: ${categoryMap.size}`);

    // İstatistikleri yazdır
    const stats = await prisma.taxonomyCategory.groupBy({
      by: ["depth"],
      _count: {
        id: true,
      },
      orderBy: {
        depth: "asc",
      },
    });

    console.log("\nCategory distribution by depth:");
    stats.forEach((stat) => {
      console.log(`  Depth ${stat.depth}: ${stat._count.id} categories`);
    });
  } catch (error) {
    console.error("Error during taxonomy seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
seedTaxonomyCategories().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
