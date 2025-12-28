import { Currency, Locale } from "@repo/database/client";
import { VariantProductZodType } from "@repo/types";

type VariantGroup = {
  groupId: string;
  options: VariantOption[];
};

type VariantOption = {
  optionId: string;
  optionName: string;
};

type CombinatedVariant = VariantProductZodType["combinatedVariants"][number];

const generateSku = (productId: string, optionNames: string[]): string => {
  const prefix = productId.slice(-8).toUpperCase();
  const suffix = optionNames
    .map((name) =>
      name
        .replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, "")
        .slice(0, 4)
        .toUpperCase()
    )
    .join("-");

  return `${prefix}-${suffix}`;
};

const getTrName = (
  translations: { locale: string; name: string }[]
): string => {
  return (
    translations.find((t) => t.locale === "TR")?.name ||
    translations[0]?.name ||
    ""
  );
};

const generateCartesianProduct = (
  groups: VariantGroup[]
): VariantOption[][] => {
  if (groups.length === 0) return [];

  const [first, ...rest] = groups;
  if (!first) return [];

  if (rest.length === 0) {
    return first.options.map((option) => [option]);
  }

  const restCombinations = generateCartesianProduct(rest);

  return first.options.flatMap((option) =>
    restCombinations.map((combo) => [option, ...combo])
  );
};

const createCombinationKey = (
  variantIds: { variantGroupId: string; variantOptionId: string }[]
): string => {
  return [...variantIds]
    .sort((a, b) => a.variantGroupId.localeCompare(b.variantGroupId))
    .map((v) => `${v.variantGroupId}:${v.variantOptionId}`)
    .join("|");
};

const createDefaultCombination = (
  variantIds: { variantGroupId: string; variantOptionId: string }[],
  optionNames: string[],
  productId: string
): CombinatedVariant => {
  return {
    variantIds,
    sku: generateSku(productId, optionNames),
    barcode: null,
    prices: [
      {
        currency: "TRY" as Currency,
        price: 0,
        discountPrice: null,
        buyedPrice: null,
      },
    ],
    stock: 0,
    active: true,
    existingImages: null,
    images: null,
    translations: [
      {
        locale: "TR" as Locale,
        description: null,
        metaTitle: null,
        metaDescription: null,
      },
    ],
  };
};

export function returnCombinateVariant({
  existingVariants,
  existingCombinatedVariants = [],
  productId,
}: {
  existingVariants: VariantProductZodType["existingVariants"];
  existingCombinatedVariants?: VariantProductZodType["combinatedVariants"];
  productId: string;
}): VariantProductZodType["combinatedVariants"] {
  if (!existingVariants || existingVariants.length === 0) {
    return [];
  }

  // Deduplicate variants by uniqueId
  const uniqueVariantsMap = new Map(
    existingVariants.map((v) => [v.uniqueId, v])
  );
  const uniqueVariants = Array.from(uniqueVariantsMap.values());

  // Build variant groups
  const variantGroups: VariantGroup[] = uniqueVariants.map((variant) => ({
    groupId: variant.uniqueId,
    options: variant.options.map((option) => ({
      optionId: option.uniqueId,
      optionName: getTrName(option.translations),
    })),
  }));

  // Build existing combinations map
  const existingMap = new Map<string, CombinatedVariant>();

  for (const combo of existingCombinatedVariants) {
    const isValid =
      combo.variantIds.length === uniqueVariants.length &&
      combo.variantIds.every((vid) => {
        const variant = uniqueVariantsMap.get(vid.variantGroupId);
        return variant?.options.some((o) => o.uniqueId === vid.variantOptionId);
      });

    if (isValid) {
      existingMap.set(createCombinationKey(combo.variantIds), combo);
    }
  }

  // Generate all combinations
  const allCombinations = generateCartesianProduct(variantGroups);

  return allCombinations.map((combination) => {
    const variantIds = combination.map((option, idx) => ({
      variantGroupId: variantGroups[idx]!.groupId,
      variantOptionId: option.optionId,
    }));

    const key = createCombinationKey(variantIds);
    const existing = existingMap.get(key);

    if (existing) {
      return { ...existing, variantIds };
    }

    const optionNames = combination.map((o) => o.optionName);
    return createDefaultCombination(variantIds, optionNames, productId);
  });
}
