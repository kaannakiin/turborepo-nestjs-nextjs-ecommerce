import { $Enums, UserRole } from "@repo/database";
import { SortAdminUserTable, VariantProductZodType } from "@repo/types";

export function getUserRoleLabels(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "OWNER":
      return "Yönetici";
    default:
      return "Kullanıcı";
  }
}

export function getSortAdminUserTableLabels(sort: SortAdminUserTable) {
  switch (sort) {
    case SortAdminUserTable.nameAsc:
      return "İsim A → Z";
    case SortAdminUserTable.nameDesc:
      return "İsim Z → A";
    case SortAdminUserTable.createdAtAsc:
      return "Eski → Yeni";
    case SortAdminUserTable.createdAtDesc:
      return "Yeni → Eski";
    default:
      return "Eski → Yeni";
  }
}

export function getProductTypeLabel(type: $Enums.ProductType) {
  switch (type) {
    case "PHYSICAL":
      return "Fiziksel";
    case "DIGITAL":
      return "Dijital";
    default:
      return "Fiziksel";
  }
}
export function getCurrencyLabel(currency: $Enums.Currency) {
  switch (currency) {
    case "TRY":
      return "Türk Lirası (₺)";
    case "USD":
      return "ABD Doları ($)";
    case "EUR":
      return "Euro (€)";
    case "GBP":
      return "İngiliz Sterlini (£)";
    default:
      return currency;
  }
}
export function getDiscountTypeLabel(type: $Enums.DiscountType) {
  switch (type) {
    case "BUY_X_GET_Y":
      return "X Al Y Kazan";
    case "PERCENTAGE":
      return "Yüzdelik";
    case "FIXED":
      return "Sabit Tutar";
    case "FREE_SHIPPING":
      return "Ücretsiz Kargo";
    default:
      return type;
  }
}
export function getCouponGenerationTypeLabel(
  type: $Enums.CouponGenerationType
) {
  switch (type) {
    case "MANUAL":
      return "Manuel İndirim";
    case "AUTOMATIC":
      return "Otomatik İndirim";
    default:
      return type;
  }
}
export function getCouponGenerationTypeTooltip(
  type: $Enums.CouponGenerationType
) {
  switch (type) {
    case "AUTOMATIC":
      return "Koşul bazlı indirimlerdir. Belirli koşullar sağlandığında otomatik olarak uygulanır.";
    case "MANUAL":
      return "Kupon kodu gerektirir. Müşteriler kupon kodunu kullanarak indirimi alabilir.";
  }
}

export function returnCombinateVariant({
  existingVariants,
  existingCombinatedVariants = [],
}: {
  existingVariants: VariantProductZodType["existingVariants"];
  existingCombinatedVariants?: VariantProductZodType["combinatedVariants"];
}): VariantProductZodType["combinatedVariants"] {
  if (!existingVariants || existingVariants.length === 0) {
    return [];
  }

  // Unique variants elde et (uniqueId'ye göre deduplicate)
  const uniqueVariants = existingVariants.reduce(
    (acc, variant) => {
      const existingIndex = acc.findIndex(
        (v) => v.uniqueId === variant.uniqueId
      );
      if (existingIndex !== -1) {
        acc[existingIndex] = variant; // En son versiyonu kullan
      } else {
        acc.push(variant);
      }
      return acc;
    },
    [] as typeof existingVariants
  );

  // Her varyant grubunun seçeneklerini al
  const variantGroups = uniqueVariants.map((variant) => ({
    groupId: variant.uniqueId,
    groupName:
      variant.translations.find((t) => t.locale === "TR")?.name ||
      variant.translations[0]?.name ||
      "",
    options: variant.options.map((option) => ({
      optionId: option.uniqueId,
      optionName:
        option.translations.find((t) => t.locale === "TR")?.name ||
        option.translations[0]?.name ||
        "",
    })),
  }));

  // Cartesian product ile tüm kombinasyonları oluştur
  type OptionType = {
    optionId: string;
    optionName: string;
  };

  function generateCartesianProduct(
    groups: typeof variantGroups
  ): OptionType[][] {
    if (groups.length === 0) return [];

    const [firstGroup, ...restGroups] = groups;

    if (!firstGroup) return [];

    if (restGroups.length === 0) {
      return firstGroup.options.map((option) => [option]);
    }

    const restCombinations: OptionType[][] =
      generateCartesianProduct(restGroups);

    return firstGroup.options.flatMap((option) =>
      restCombinations.map((restCombination: OptionType[]) => [
        option,
        ...restCombination,
      ])
    );
  }

  const allCombinations = generateCartesianProduct(variantGroups);

  // Mevcut kombinasyonları anahtar-değer eşlemesi oluştur
  const existingCombinationMap = new Map<
    string,
    VariantProductZodType["combinatedVariants"][0]
  >();

  if (existingCombinatedVariants.length > 0) {
    existingCombinatedVariants.forEach((combination) => {
      // Kombinasyon hala geçerli mi kontrol et
      const isValid = combination.variantIds.every((variantId) => {
        const variant = uniqueVariants.find(
          (v) => v.uniqueId === variantId.variantGroupId
        );
        if (!variant) return false;

        return variant.options.some(
          (option) => option.uniqueId === variantId.variantOptionId
        );
      });

      // Kombinasyon tüm varyant gruplarını içeriyor mu kontrol et
      const hasAllGroups =
        combination.variantIds.length === uniqueVariants.length &&
        uniqueVariants.every((variant) =>
          combination.variantIds.some(
            (vid) => vid.variantGroupId === variant.uniqueId
          )
        );

      if (isValid && hasAllGroups) {
        // Kombinasyon anahtarı oluştur (sıralı)
        const sortedIds = [...combination.variantIds].sort((a, b) =>
          a.variantGroupId.localeCompare(b.variantGroupId)
        );

        const key = sortedIds
          .map((vid) => `${vid.variantGroupId}:${vid.variantOptionId}`)
          .join("|");

        existingCombinationMap.set(key, combination);
      }
    });
  }

  // Yeni kombinasyonları oluştur
  const newCombinations: VariantProductZodType["combinatedVariants"] =
    allCombinations.map((combination: OptionType[], index: number) => {
      // Kombinasyon için varyant ID'leri oluştur
      const variantIds = combination.map((option: OptionType, idx: number) => ({
        variantGroupId: variantGroups[idx]?.groupId || "",
        variantOptionId: option.optionId,
      }));

      // Sıralı kombinasyon anahtarı oluştur
      const sortedIds = [...variantIds].sort((a, b) =>
        a.variantGroupId.localeCompare(b.variantGroupId)
      );

      const combinationKey = sortedIds
        .map((vid) => `${vid.variantGroupId}:${vid.variantOptionId}`)
        .join("|");

      // Mevcut kombinasyon var mı kontrol et
      const existingCombination = existingCombinationMap.get(combinationKey);

      if (existingCombination) {
        // Mevcut kombinasyonu koru, sadece variantIds güncelle
        return {
          ...existingCombination,
          variantIds,
        };
      } else {
        // Yeni kombinasyon oluştur
        const optionNames = combination.map(
          (option: OptionType) => option.optionName
        );
        const combinationName = optionNames.join("-");

        return {
          variantIds,
          sku: `SKU-${combinationName.toUpperCase().replace(/[^A-Z0-9]/g, "-")}`,
          barcode: `BAR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          prices: [
            {
              currency: "TRY" as $Enums.Currency,
              price: 0,
              discountPrice: null,
              buyedPrice: null,
            },
          ],
          stock: 0,
          existingImages: null,
          active: true,
          images: null,
          translations: [
            {
              locale: "TR" as $Enums.Locale,
              description: null,
              slug: combinationName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              metaTitle: null,
              metaDescription: null,
            },
          ],
        };
      }
    });

  return newCombinations;
}
