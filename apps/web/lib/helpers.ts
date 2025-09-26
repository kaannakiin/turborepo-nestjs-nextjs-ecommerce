import { MantineColorsTuple } from "@mantine/core";
import { $Enums, UserRole } from "@repo/database";
import {
  FontFamily,
  LocationType,
  MantineFontWeight,
  MantineSize,
  ProductPageDataType,
  ShippingRuleType,
  SortAdminUserTable,
  TextAlign,
  VariantProductZodType,
} from "@repo/types";

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

export function getMantineSizeLabel(size: MantineSize) {
  switch (size) {
    case MantineSize.xs:
      return "Ekstra Küçük";
    case MantineSize.sm:
      return "Küçük";
    case MantineSize.md:
      return "Orta";
    case MantineSize.lg:
      return "Büyük";
    case MantineSize.xl:
      return "Ekstra Büyük";
  }
}

export function getMantineFontWeightLabel(weight: MantineFontWeight) {
  switch (weight) {
    case "thin":
      return "İnce";
    case "normal":
      return "Normal";
    case "bold":
      return "Kalın";
    case "extralight":
      return "Ekstra İnce";
    case "light":
      return "Hafif";
    case "semibold":
      return "Yarı Kalın";
    case "medium":
      return "Medium";
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

export function getCurrencySymbol(currency: $Enums.Currency) {
  switch (currency) {
    case "TRY":
      return "₺";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
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

export function getCurrencyIntlFormat(currency: $Enums.Currency) {
  switch (currency) {
    case "TRY":
      return "tr-TR";
    case "USD":
      return "en-US";
    case "EUR":
      return "de-DE";
    case "GBP":
      return "en-GB";
    default:
      return "tr-TR";
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

export function buildVariantOrProductUrl(
  productInfos: ProductPageDataType["translations"],
  variantInfos?: ProductPageDataType["variantCombinations"][number]["options"][number][],
  locale: $Enums.Locale = "TR"
) {
  const productTranslation =
    productInfos.find((tr) => tr.locale === locale) || productInfos[0];

  if (!productTranslation) return null;

  const baseSlug = productTranslation.slug;

  // Variant bilgileri varsa query parametreleriyle URL oluştur
  if (variantInfos && variantInfos.length > 0) {
    const searchParams = new URLSearchParams();

    variantInfos.forEach((variant) => {
      const variantTranslation =
        variant.productVariantOption.variantOption.translations.find(
          (t) => t.locale === locale
        ) || variant.productVariantOption.variantOption.translations[0];

      const variantGroupTranslation =
        variant.productVariantOption.variantOption.variantGroup.translations.find(
          (t) => t.locale === locale
        ) ||
        variant.productVariantOption.variantOption.variantGroup.translations[0];

      if (variantTranslation && variantGroupTranslation) {
        searchParams.set(variantGroupTranslation.slug, variantTranslation.slug);
      }
    });

    return `/${baseSlug}?${searchParams.toString()}`;
  }

  // Variant yoksa sadece temel slug'ı return et
  return `/${baseSlug}`;
}

export function buildVariantUrl(
  baseSlug: string,
  currentParams: Record<string, string | undefined>,
  newVariantOptions: Record<string, string>
) {
  const params = new URLSearchParams();

  Object.entries(currentParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  Object.entries(newVariantOptions).forEach(([groupSlug, optionSlug]) => {
    params.set(groupSlug, optionSlug);
  });

  return `/${baseSlug}?${params.toString()}`;
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

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): HSL {
  // Hex'i RGB'ye çevir
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  if (h < 0) h += 360;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const rHex = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const gHex = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const bHex = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

function adjustColorForExtreme(hex: string): string {
  const { h, s, l } = hexToHsl(hex);

  // Ekstrem durumları düzelt
  const adjustedH = h;
  let adjustedS = s;
  let adjustedL = l;

  // Çok koyu renkler için (siyah gibi)
  if (l < 0.05) {
    adjustedL = 0.15; // Biraz açıklat
    adjustedS = Math.max(s, 0.3); // Minimum doygunluk ekle
  }

  // Çok açık renkler için (beyaz gibi)
  if (l > 0.95) {
    adjustedL = 0.85; // Biraz koyulat
    adjustedS = Math.max(s, 0.1); // Minimum doygunluk ekle
  }

  // Çok soluk renkler için
  if (s < 0.05) {
    adjustedS = 0.3; // Minimum doygunluk
  }

  return hslToHex(adjustedH, adjustedS, adjustedL);
}

export function hexToMantineColorsTuple(hex: string): MantineColorsTuple {
  // Hex formatını kontrol et ve düzelt
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  cleanHex = `#${cleanHex}`;

  // Ekstrem renkleri ayarla
  const adjustedHex = adjustColorForExtreme(cleanHex);
  const { h, s, l } = hexToHsl(adjustedHex);

  // 10 farklı lightness değeri oluştur
  const lightnessList = [
    0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25, 0.15, 0.05,
  ];

  // Orijinal rengin hangi indekse yakın olduğunu bul
  const originalLightness = l;
  let targetIndex = 5; // Default olarak ortaya yerleştir

  for (let i = 0; i < lightnessList.length; i++) {
    if (
      Math.abs(lightnessList[i] - originalLightness) <
      Math.abs(lightnessList[targetIndex] - originalLightness)
    ) {
      targetIndex = i;
    }
  }

  const colors: string[] = [];

  for (let i = 0; i < 10; i++) {
    if (i === targetIndex) {
      // Orijinal rengi kullan
      colors.push(adjustedHex.toUpperCase());
    } else {
      // Lightness'ı ayarlayarak yeni renk oluştur
      let adjustedSaturation = s;

      // Çok açık tonlarda doygunluğu azalt
      if (lightnessList[i] > 0.8) {
        adjustedSaturation = s * (1 - (lightnessList[i] - 0.8) * 2);
      }

      // Çok koyu tonlarda doygunluğu artır
      if (lightnessList[i] < 0.2) {
        adjustedSaturation = Math.min(1, s * 1.2);
      }

      const newColor = hslToHex(h, adjustedSaturation, lightnessList[i]);
      colors.push(newColor.toUpperCase());
    }
  }

  return colors as unknown as MantineColorsTuple;
}

export function getTextAlignLabel(align: TextAlign): string {
  switch (align) {
    case TextAlign.center:
      return "Ortala";
    case TextAlign.right:
      return "Sağa Hizala";
    case TextAlign.left:
      return "Sola Hizala";
  }
}

export function getFontFamilyLabel(fontFamily: FontFamily): string {
  switch (fontFamily) {
    // Sistem fontları
    case FontFamily.system:
      return "Sistem Font";
    case FontFamily.mantineDefault:
      return "Mantine Varsayılan";

    // Sans-serif fontlar
    case FontFamily.inter:
      return "Inter";
    case FontFamily.roboto:
      return "Roboto";
    case FontFamily.openSans:
      return "Open Sans";
    case FontFamily.lato:
      return "Lato";
    case FontFamily.montserrat:
      return "Montserrat";
    case FontFamily.nunito:
      return "Nunito";
    case FontFamily.poppins:
      return "Poppins";
    case FontFamily.quicksand:
      return "Quicksand";
    case FontFamily.raleway:
      return "Raleway";

    // Serif fontlar
    case FontFamily.timesNewRoman:
      return "Times New Roman";
    case FontFamily.georgia:
      return "Georgia";
    case FontFamily.playfairDisplay:
      return "Playfair Display";
    case FontFamily.merriweather:
      return "Merriweather";
    case FontFamily.crimsonText:
      return "Crimson Text";

    // Monospace fontlar
    case FontFamily.jetBrainsMono:
      return "JetBrains Mono";
    case FontFamily.firaCode:
      return "Fira Code";
    case FontFamily.sourceCodePro:
      return "Source Code Pro";
    case FontFamily.courierNew:
      return "Courier New";

    // Cursive fontlar
    case FontFamily.dancingScript:
      return "Dancing Script";
    case FontFamily.greatVibes:
      return "Great Vibes";

    // Genel kategoriler
    case FontFamily.sansSerif:
      return "Sans Serif";
    case FontFamily.serif:
      return "Serif";
    case FontFamily.monospace:
      return "Monospace";
    case FontFamily.cursive:
      return "Cursive";

    default:
      return "Bilinmeyen Font";
  }
}

export function getSelectionTextShipping(data: LocationType) {
  if (data.countryType === "NONE") {
    return "Tüm ülke";
  }

  if (data.countryType === "STATE") {
    if (!data.stateIds || data.stateIds.length === 0) {
      return "Tüm ülke";
    }

    const selectedCount = data.stateIds.length;
    if (selectedCount === 0) {
      return "Tüm ülke";
    }

    return `${selectedCount} eyalet`;
  }

  if (data.countryType === "CITY") {
    if (!data.cityIds || data.cityIds.length === 0) {
      return "Tüm ülke";
    }

    const selectedCount = data.cityIds.length;
    if (selectedCount === 0) {
      return "Tüm ülke";
    }

    return `${selectedCount} şehir`;
  }

  return "Tüm ülke";
}

export const getConditionText = (data: ShippingRuleType) => {
  if (data.condition.type === "SalesPrice") {
    const min = data.condition.minSalesPrice;
    const max = data.condition.maxSalesPrice;
    const currency = getCurrencySymbol(data.currency);

    if (min && max) {
      return `${currency}${min} - ${currency}${max} arası`;
    } else if (min) {
      return `${currency}${min} ve üzeri`;
    } else if (max) {
      return `${currency}${max}  altı`;
    }
    return "-";
  } else {
    const min = data.condition.minProductWeight;
    const max = data.condition.maxProductWeight;

    if (min && max) {
      return `${min}g - ${max}g arası`;
    } else if (min) {
      return `${min}g ve üzeri`;
    } else if (max) {
      return `${max}g altı`;
    }
    return "-";
  }
};
