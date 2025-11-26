import fetch from "node-fetch";
import iconv from "iconv-lite";
import { prisma } from "../client.js";

async function seedTaxonomyCategories() {
  console.log("🚀 Starting taxonomy seeding process...");
  console.log("=".repeat(60));

  // Önce mevcut taxonomy verilerini temizle
  console.log("\n📦 Step 1: Clearing existing data...");
  await prisma.taxonomyCategory.deleteMany({});
  console.log("✅ Cleared existing taxonomy categories.");

  try {
    // 1. ADIM: Google taxonomy dosyasını ID'Lİ olan URL'den fetch et
    console.log("\n📥 Step 2: Fetching Google taxonomy file...");
    const response = await fetch(
      "https://www.google.com/basepages/producttype/taxonomy-with-ids.tr-TR.txt"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("✅ File fetched successfully.");

    // Buffer olarak al ve UTF-8'e çevir
    console.log("\n🔄 Step 3: Decoding file content...");
    const buffer = await response.buffer();
    const textContent = iconv.decode(buffer, "utf8");
    console.log("✅ Successfully decoded taxonomy file.");

    // Satırlara ayır ve yorum satırlarını filtrele
    console.log("\n🔍 Step 4: Processing lines...");
    const lines = textContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));

    console.log(`✅ Found ${lines.length} taxonomy lines to process.`);

    // 2. ADIM: Her bir kategori yolu için Google ID'sini bir haritada sakla
    console.log("\n🗺️  Step 5: Building path-to-ID map...");
    const pathIdMap = new Map<string, string>();

    let processedLines = 0;
    for (const line of lines) {
      const parts = line.split(" - ");
      if (parts.length < 2) continue;

      const googleId = parts[0].trim();
      const fullPath = parts.slice(1).join(" - ").trim();
      pathIdMap.set(fullPath, googleId);

      processedLines++;
      if (processedLines % 500 === 0) {
        console.log(
          `   ⏳ Processed ${processedLines}/${lines.length} lines...`
        );
      }
    }

    console.log(`✅ Created a map of ${pathIdMap.size} unique category paths.`);

    // 3. ADIM: Kategorileri veritabanına ekle
    console.log("\n💾 Step 6: Creating categories in database...");
    console.log("=".repeat(60));

    const createdCategoryMap = new Map<string, string>();
    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Her 100 satırda bir ilerleme göster
      if (i % 100 === 0) {
        console.log(`\n📊 Progress: ${i}/${lines.length} lines processed`);
        console.log(
          `   ✅ Created: ${createdCount} | ⏭️  Skipped: ${skippedCount}`
        );
      }

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
          continue;
        }

        // Kategorinin Google ID'sini önceden oluşturduğumuz haritadan al
        const googleId = pathIdMap.get(currentPath);
        if (!googleId) {
          console.warn(
            `  ⚠️  Warning: Could not find Google ID for path: "${currentPath}"`
          );
          skippedCount++;
          continue;
        }

        // Kategoriyi veritabanında oluştur
        console.log(`  ➕ Creating: [${googleId}] ${currentPath}`);
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

        createdCategoryMap.set(currentPath, category.id);
        parentId = category.id;
        createdCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Taxonomy seeding completed successfully!");
    console.log("=".repeat(60));
    console.log(
      `📈 Total unique categories created: ${createdCategoryMap.size}`
    );
    console.log(`✅ Successfully created: ${createdCount}`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount}`);

    // İstatistikleri yazdır
    console.log("\n📊 Category distribution by depth:");
    const stats = await prisma.taxonomyCategory.groupBy({
      by: ["depth"],
      _count: {
        id: true,
      },
      orderBy: {
        depth: "asc",
      },
    });

    stats.forEach((stat) => {
      console.log(`   📍 Depth ${stat.depth}: ${stat._count.id} categories`);
    });

    console.log("\n✨ All done!");
  } catch (error) {
    console.error("\n❌ Error during taxonomy seeding:", error);
    throw error;
  } finally {
    console.log("\n🔌 Disconnecting from database...");
    await prisma.$disconnect();
    console.log("✅ Disconnected.");
  }
}

// Script'i çalıştır
seedTaxonomyCategories().catch((error) => {
  console.error("💥 Fatal error running the seed script:", error);
  process.exit(1);
});
