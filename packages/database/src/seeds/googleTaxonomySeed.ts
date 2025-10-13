import { PrismaClient } from "../../generated/prisma";
import fetch from "node-fetch";
import iconv from "iconv-lite";

const prisma = new PrismaClient();

async function seedTaxonomyCategories() {
  console.log("Starting taxonomy seeding process...");

  // Önce mevcut taxonomy verilerini temizle
  await prisma.taxonomyCategory.deleteMany({});
  console.log("Cleared existing taxonomy categories.");

  try {
    // 1. ADIM: Google taxonomy dosyasını ID'Lİ olan URL'den fetch et
    const response = await fetch(
      "https://www.google.com/basepages/producttype/taxonomy-with-ids.tr-TR.txt"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Buffer olarak al ve UTF-8'e çevir. Google'ın dosyası bazen farklı encoding'de olabiliyor.
    const buffer = await response.buffer();
    const textContent = iconv.decode(buffer, "utf8");
    console.log("Successfully fetched and decoded taxonomy file.");

    // Satırlara ayır ve yorum satırlarını filtrele
    const lines = textContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));

    console.log(`Found ${lines.length} taxonomy lines to process.`);

    // 2. ADIM: Her bir kategori yolu için Google ID'sini bir haritada sakla.
    // Bu, üst kategorilerin ID'lerini kolayca bulmamızı sağlayacak.
    const pathIdMap = new Map<string, string>();
    for (const line of lines) {
      const parts = line.split(" - ");
      if (parts.length < 2) continue;

      const googleId = parts[0].trim();
      const fullPath = parts.slice(1).join(" - ").trim();
      pathIdMap.set(fullPath, googleId);
    }
    console.log(
      `Created a map of ${pathIdMap.size} unique category paths to their Google IDs.`
    );

    // 3. ADIM: Kategorileri veritabanına ekle.
    // Her kategori için parent-child ilişkilerini takip etmek için bir harita
    const createdCategoryMap = new Map<string, string>(); // path -> bizim veritabanı ID'miz (cuid)

    for (const line of lines) {
      const parts = line.split(" - ");
      if (parts.length < 2) continue;

      const fullPathString = parts.slice(1).join(" - ").trim();
      const categoryParts = fullPathString
        .split(">")
        .map((part) => part.trim());

      let currentPath = "";
      let parentId: string | null = null;

      for (let depth = 0; depth < categoryParts.length; depth++) {
        const categoryName = categoryParts[depth];
        currentPath = currentPath
          ? `${currentPath} > ${categoryName}`
          : categoryName;

        // Bu path için kategori zaten veritabanına eklendi mi?
        if (createdCategoryMap.has(currentPath)) {
          parentId = createdCategoryMap.get(currentPath)!;
          continue; // Zaten varsa bir sonraki seviyeye geç
        }

        // Kategorinin Google ID'sini önceden oluşturduğumuz haritadan al
        const googleId = pathIdMap.get(currentPath);
        if (!googleId) {
          console.warn(
            `  - Warning: Could not find Google ID for path: "${currentPath}". Skipping creation for this level.`
          );
          continue;
        }

        // Kategoriyi veritabanında oluştur
        const category = await prisma.taxonomyCategory.create({
          data: {
            googleId: googleId, // <-- Gerçek Google ID'sini kullanıyoruz
            originalName: categoryName,
            path: currentPath,
            pathNames: categoryParts.slice(0, depth + 1).join(" > "),
            depth: depth,
            parentId: parentId,
            isActive: true,
          },
        });

        // Oluşturulan kategoriyi haritaya ekle ki bir sonraki döngüde parent olarak kullanılabilsin
        createdCategoryMap.set(currentPath, category.id);
        parentId = category.id;
      }
    }

    console.log("\nTaxonomy seeding completed successfully!");
    console.log(`Total unique categories created: ${createdCategoryMap.size}`);

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
  console.error("Fatal error running the seed script:", error);
  process.exit(1);
});
