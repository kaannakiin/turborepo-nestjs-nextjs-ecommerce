import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log("🧹 Starting database cleanup...");

  try {
    // Transaction'ları daha küçük parçalara bölelim

    // 1. Layout ve Component sistemini temizle
    console.log("🗑️  Cleaning layout and component system...");
    await prisma.$transaction(
      async (tx) => {
        await tx.layoutComponent.deleteMany({});
        await tx.layout.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 2. Slider ve Marquee şemalarını temizle
    console.log("🗑️  Cleaning slider and marquee schemas...");
    await prisma.$transaction(
      async (tx) => {
        await tx.sliderItemSchema.deleteMany({});
        await tx.sliderSchema.deleteMany({});
        await tx.marqueeItemSchema.deleteMany({});
        await tx.marqueeSchema.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 3. Cart sistemini temizle
    console.log("🗑️  Cleaning cart system...");
    await prisma.$transaction(
      async (tx) => {
        await tx.cartItem.deleteMany({});
        await tx.cart.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 4. Discount sistemini temizle (parçalara böl)
    console.log("🗑️  Cleaning discount system - part 1...");
    await prisma.$transaction(
      async (tx) => {
        await tx.couponUsage.deleteMany({});
        await tx.discountCoupon.deleteMany({});
      },
      { timeout: 10000 }
    );

    console.log("🗑️  Cleaning discount system - part 2...");
    await prisma.$transaction(
      async (tx) => {
        await tx.discountIncludedUser.deleteMany({});
        await tx.discountIncludedVariant.deleteMany({});
        await tx.discountIncludedProduct.deleteMany({});
        await tx.discountIncludedCategory.deleteMany({});
        await tx.discountIncludedBrand.deleteMany({});
      },
      { timeout: 10000 }
    );

    console.log("🗑️  Cleaning discount system - part 3...");
    await prisma.$transaction(
      async (tx) => {
        await tx.discountCondition.deleteMany({});
        await tx.discountTranslation.deleteMany({});
        await tx.discount.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 5. Product variant sistemini temizle (parçalara böl)
    console.log("🗑️  Cleaning product variants - part 1...");
    await prisma.$transaction(
      async (tx) => {
        await tx.productVariantCombinationOption.deleteMany({});
        await tx.productVariantTranslation.deleteMany({});
      },
      { timeout: 10000 }
    );

    console.log("🗑️  Cleaning product variants - part 2...");
    await prisma.$transaction(
      async (tx) => {
        await tx.productVariantCombination.deleteMany({});
        await tx.productVariantOption.deleteMany({});
        await tx.productVariantGroup.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 6. Variant sistemini temizle
    console.log("🗑️  Cleaning variant system...");
    await prisma.$transaction(
      async (tx) => {
        await tx.variantOptionTranslation.deleteMany({});
        await tx.variantOption.deleteMany({});
        await tx.variantGroupTranslation.deleteMany({});
        await tx.variantGroup.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 7. Product ile ilişkili verileri temizle
    console.log("🗑️  Cleaning product related data...");
    await prisma.$transaction(
      async (tx) => {
        await tx.productAsset.deleteMany({});
        await tx.productPrice.deleteMany({});
        await tx.productCategory.deleteMany({});
        await tx.productTranslation.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 8. Product'ları temizle
    console.log("🗑️  Cleaning products...");
    await prisma.$transaction(
      async (tx) => {
        await tx.product.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 9. Taxonomy kategorilerini temizle
    console.log("🗑️  Cleaning taxonomy categories...");
    await prisma.$transaction(
      async (tx) => {
        await tx.taxonomyCategory.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 10. Brand sistemini temizle
    console.log("🗑️  Cleaning brand system...");
    await prisma.$transaction(
      async (tx) => {
        await tx.brandTranslation.deleteMany({});
        await tx.brand.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 11. Category sistemini temizle
    console.log("🗑️  Cleaning category system...");
    await prisma.$transaction(
      async (tx) => {
        await tx.categoryTranslation.deleteMany({});
        await tx.category.deleteMany({});
      },
      { timeout: 10000 }
    );

    // 12. İlişkili Asset'leri temizle
    console.log("🗑️  Cleaning product/brand/category/variant assets...");

    // İlişkiler temizlendikten sonra artık bu asset'ler güvenle silinebilir
    // Sadece User imageUrl'leri korunacak (User tablosunda imageUrl field'ı var)
    const userAssets = await prisma.user.findMany({
      where: { imageUrl: { not: null } },
      select: { imageUrl: true },
    });

    const userImageUrls = userAssets
      .map((user) => user.imageUrl)
      .filter(Boolean);

    await prisma.$transaction(
      async (tx) => {
        // User asset'leri hariç tümünü sil
        await tx.asset.deleteMany({
          where: {
            url: {
              notIn: userImageUrls,
            },
          },
        });
        console.log(`   Kept ${userImageUrls.length} user profile images`);
      },
      { timeout: 30000 }
    );

    console.log("✅ Database cleanup completed successfully!");
    console.log("📊 Kept data: Users, Countries, States, Cities, User Assets");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }
}

async function verifyCleanup() {
  console.log("🔍 Verifying cleanup...");

  const counts = {
    users: await prisma.user.count(),
    countries: await prisma.country.count(),
    states: await prisma.state.count(),
    cities: await prisma.city.count(),
    assets: await prisma.asset.count(),
    products: await prisma.product.count(),
    categories: await prisma.category.count(),
    brands: await prisma.brand.count(),
    variants: await prisma.variantGroup.count(),
    carts: await prisma.cart.count(),
    discounts: await prisma.discount.count(),
    layouts: await prisma.layout.count(),
  };

  console.log("📈 Current database counts:");
  console.table(counts);
}

async function main() {
  try {
    await cleanupDatabase();
    await verifyCleanup();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Güvenlik kontrolü - production'da çalışmasın
if (process.env.NODE_ENV === "production") {
  console.error("❌ This cleanup script cannot run in production!");
  process.exit(1);
}

main().catch((e) => {
  console.error("❌ Unhandled error:", e);
  process.exit(1);
});
