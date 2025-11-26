import { prisma } from "..";
/**
 * Bir ürünü ve tüm ilişkili kayıtlarını güvenli bir şekilde siler
 * @param productId - Silinecek ürünün ID'si
 */
async function deleteProductCompletely(productId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      console.log(`🗑️  Product silme işlemi başlatılıyor: ${productId}`);

      // 1. ProductVariantCombinationOption'ları sil
      const combinationOptions =
        await tx.productVariantCombinationOption.findMany({
          where: {
            combination: {
              productId: productId,
            },
          },
        });

      if (combinationOptions.length > 0) {
        await tx.productVariantCombinationOption.deleteMany({
          where: {
            combination: {
              productId: productId,
            },
          },
        });
        console.log(
          `✅ ${combinationOptions.length} ProductVariantCombinationOption silindi`
        );
      }

      // 2. ProductVariantTranslation'ları sil
      const variantTranslations = await tx.productVariantTranslation.findMany({
        where: {
          combination: {
            productId: productId,
          },
        },
      });

      if (variantTranslations.length > 0) {
        await tx.productVariantTranslation.deleteMany({
          where: {
            combination: {
              productId: productId,
            },
          },
        });
        console.log(
          `✅ ${variantTranslations.length} ProductVariantTranslation silindi`
        );
      }

      // 3. ProductPrice'ları sil (combination ile ilişkili olanlar)
      const combinationPrices = await tx.productPrice.findMany({
        where: {
          combination: {
            productId: productId,
          },
        },
      });

      if (combinationPrices.length > 0) {
        await tx.productPrice.deleteMany({
          where: {
            combination: {
              productId: productId,
            },
          },
        });
        console.log(
          `✅ ${combinationPrices.length} ProductPrice (combination) silindi`
        );
      }

      // 4. ProductAsset'ları sil (combination ile ilişkili olanlar)
      const combinationAssets = await tx.productAsset.findMany({
        where: {
          combination: {
            productId: productId,
          },
        },
      });

      if (combinationAssets.length > 0) {
        await tx.productAsset.deleteMany({
          where: {
            combination: {
              productId: productId,
            },
          },
        });
        console.log(
          `✅ ${combinationAssets.length} ProductAsset (combination) silindi`
        );
      }

      // 5. ProductVariantCombination'ları sil
      const combinations = await tx.productVariantCombination.findMany({
        where: { productId: productId },
      });

      if (combinations.length > 0) {
        await tx.productVariantCombination.deleteMany({
          where: { productId: productId },
        });
        console.log(
          `✅ ${combinations.length} ProductVariantCombination silindi`
        );
      }

      // 6. ProductVariantOption'ları sil
      const variantOptions = await tx.productVariantOption.findMany({
        where: {
          productVariantGroup: {
            productId: productId,
          },
        },
      });

      if (variantOptions.length > 0) {
        await tx.productVariantOption.deleteMany({
          where: {
            productVariantGroup: {
              productId: productId,
            },
          },
        });
        console.log(`✅ ${variantOptions.length} ProductVariantOption silindi`);
      }

      // 7. ProductVariantGroup'ları sil
      const variantGroups = await tx.productVariantGroup.findMany({
        where: { productId: productId },
      });

      if (variantGroups.length > 0) {
        await tx.productVariantGroup.deleteMany({
          where: { productId: productId },
        });
        console.log(`✅ ${variantGroups.length} ProductVariantGroup silindi`);
      }

      // 8. ProductPrice'ları sil (normal product ile ilişkili olanlar)
      const productPrices = await tx.productPrice.findMany({
        where: { productId: productId },
      });

      if (productPrices.length > 0) {
        await tx.productPrice.deleteMany({
          where: { productId: productId },
        });
        console.log(
          `✅ ${productPrices.length} ProductPrice (product) silindi`
        );
      }

      // 9. ProductAsset'ları sil (normal product ile ilişkili olanlar)
      const productAssets = await tx.productAsset.findMany({
        where: { productId: productId },
      });

      if (productAssets.length > 0) {
        await tx.productAsset.deleteMany({
          where: { productId: productId },
        });
        console.log(
          `✅ ${productAssets.length} ProductAsset (product) silindi`
        );
      }

      // 10. ProductTranslation'ları sil
      const productTranslations = await tx.productTranslation.findMany({
        where: { productId: productId },
      });

      if (productTranslations.length > 0) {
        await tx.productTranslation.deleteMany({
          where: { productId: productId },
        });
        console.log(
          `✅ ${productTranslations.length} ProductTranslation silindi`
        );
      }

      // 11. Son olarak Product'ı sil
      await tx.product.delete({
        where: { id: productId },
      });
      console.log(`✅ Product başarıyla silindi: ${productId}`);
    });

    console.log(`🎉 Product silme işlemi tamamlandı: ${productId}`);
  } catch (error) {
    console.error(`❌ Product silme hatası: ${productId}`, error);
    throw error;
  }
}

/**
 * Belirli kriterlere göre birden fazla ürünü siler
 * @param criteria - Silme kriterleri
 */
async function deleteBulkProducts(criteria: {
  isVariant?: boolean;
  type?: "PHYSICAL" | "DIGITAL";
  createdBefore?: Date;
}) {
  try {
    const products = await prisma.product.findMany({
      where: {
        ...(criteria.isVariant !== undefined && {
          isVariant: criteria.isVariant,
        }),
        ...(criteria.type && { type: criteria.type }),
        ...(criteria.createdBefore && {
          createdAt: { lt: criteria.createdBefore },
        }),
      },
      select: {
        id: true,
        translations: { select: { name: true, locale: true } },
      },
    });

    console.log(`🔍 ${products.length} adet ürün bulundu`);

    for (const product of products) {
      const productName =
        product.translations.find((t) => t.locale === "TR")?.name ||
        "Bilinmeyen Ürün";
      console.log(`\n🗑️  "${productName}" ürünü siliniyor...`);
      await deleteProductCompletely(product.id);
    }

    console.log(
      `\n🎉 Toplu silme işlemi tamamlandı. ${products.length} ürün silindi.`
    );
  } catch (error) {
    console.error("❌ Toplu silme hatası:", error);
    throw error;
  }
}

async function deleteAllVariantProducts() {
  await deleteBulkProducts({ isVariant: true });
}

// Örnek kullanım:
async function main() {
  try {
    await deleteAllVariantProducts();

    console.log("Script tamamlandı");
  } catch (error) {
    console.error("Ana hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştırmak için aşağıdaki satırı açın:
main();
