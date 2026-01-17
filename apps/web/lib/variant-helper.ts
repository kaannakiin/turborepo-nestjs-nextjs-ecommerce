import { ProductDetailVariant, ProductDetailVariantGroup } from "@repo/types";

export const getVariantSlugsFromParams = (
  searchParams: URLSearchParams,
  variantGroups: ProductDetailVariantGroup[]
): Record<string, string> => {
  const selectedSlugs: Record<string, string> = {};

  variantGroups.forEach((group) => {
    const groupSlug = group.variantGroup.translations[0]?.slug;
    if (!groupSlug) return;

    const paramValue = searchParams.get(groupSlug);
    if (paramValue) {
      selectedSlugs[groupSlug] = paramValue;
    }
  });

  return selectedSlugs;
};

export const getSelectedOptionIds = (
  selectedSlugs: Record<string, string>,
  variantGroups: ProductDetailVariantGroup[]
): Record<string, string> => {
  const selectedOptionIds: Record<string, string> = {};

  variantGroups.forEach((group) => {
    const groupSlug = group.variantGroup.translations[0]?.slug;
    const groupId = group.variantGroup.id;
    if (!groupSlug) return;

    const selectedSlug = selectedSlugs[groupSlug];
    if (!selectedSlug) return;

    const option = group.options.find(
      (opt) => opt.variantOption.translations[0]?.slug === selectedSlug
    );

    if (option) {
      selectedOptionIds[groupId] = option.variantOption.id;
    }
  });

  return selectedOptionIds;
};

export const findMatchingVariant = (
  selectedOptionIds: Record<string, string>,
  variants: ProductDetailVariant[],
  variantGroups: ProductDetailVariantGroup[]
): ProductDetailVariant | null => {
  const requiredGroupCount = variantGroups.length;
  const selectedCount = Object.keys(selectedOptionIds).length;

  if (selectedCount !== requiredGroupCount) {
    return null;
  }

  return (
    variants.find((variant) => {
      const variantOptionIds = variant.options.map(
        (opt) => opt.productVariantOption.variantOption.id
      );

      return Object.values(selectedOptionIds).every((optionId) =>
        variantOptionIds.includes(optionId)
      );
    }) || null
  );
};

export const getSelectableOptions = (
  selectedOptionIds: Record<string, string>,
  variantGroups: ProductDetailVariantGroup[],
  variants: ProductDetailVariant[]
): Record<string, string[]> => {
  const selectableOptions: Record<string, string[]> = {};

  variantGroups.forEach((group) => {
    const groupId = group.variantGroup.id;
    selectableOptions[groupId] = [];

    group.options.forEach((option) => {
      const optionId = option.variantOption.id;

      const hasStock = option.combinations.some(
        (comb) => comb.combination.stock > 0
      );

      if (!hasStock) return;

      const otherSelections = { ...selectedOptionIds };
      delete otherSelections[groupId];

      if (Object.keys(otherSelections).length === 0) {
        selectableOptions[groupId].push(optionId);
        return;
      }

      const isCompatible = variants.some((variant) => {
        const variantOptionIds = variant.options.map(
          (opt) => opt.productVariantOption.variantOption.id
        );

        if (!variantOptionIds.includes(optionId)) return false;

        return Object.values(otherSelections).every((otherId) =>
          variantOptionIds.includes(otherId)
        );
      });

      if (isCompatible) {
        selectableOptions[groupId].push(optionId);
      }
    });
  });

  return selectableOptions;
};

export const buildVariantUrl = (
  pathname: string,
  currentParams: URLSearchParams,
  groupSlug: string,
  optionSlug: string
): string => {
  const newParams = new URLSearchParams(currentParams.toString());
  newParams.set(groupSlug, optionSlug);
  return `${pathname}?${newParams.toString()}`;
};

export const getDefaultVariant = (
  variants: ProductDetailVariant[]
): ProductDetailVariant | null => {
  return variants.find((v) => v.stock > 0) || variants[0] || null;
};

export const getDefaultSelections = (
  defaultVariant: ProductDetailVariant | null,
  variantGroups: ProductDetailVariantGroup[]
): Record<string, string> => {
  if (!defaultVariant) return {};

  const selections: Record<string, string> = {};

  defaultVariant.options.forEach((opt) => {
    const variantOption = opt.productVariantOption.variantOption;
    const variantGroupId = variantOption.variantGroup.id;

    const group = variantGroups.find(
      (g) => g.variantGroup.id === variantGroupId
    );
    const groupSlug = group?.variantGroup.translations[0]?.slug;

    const optionSlug = variantOption.translations[0]?.slug;

    if (groupSlug && optionSlug) {
      selections[groupSlug] = optionSlug;
    }
  });

  return selections;
};

export const findBestMatchingVariant = (
  selectedOptionIds: Record<string, string>,
  variants: ProductDetailVariant[],
  variantGroups: ProductDetailVariantGroup[]
): ProductDetailVariant | null => {
  const exactMatch = findMatchingVariant(
    selectedOptionIds,
    variants,
    variantGroups
  );
  if (exactMatch) return exactMatch;

  const selectedIds = Object.values(selectedOptionIds);

  if (selectedIds.length === 0) {
    return getDefaultVariant(variants);
  }

  let bestMatch: ProductDetailVariant | null = null;
  let bestScore = -1;

  for (const variant of variants) {
    const variantOptionIds = variant.options.map(
      (opt) => opt.productVariantOption.variantOption.id
    );

    const matchCount = selectedIds.filter((id) =>
      variantOptionIds.includes(id)
    ).length;

    const stockBonus = variant.stock > 0 ? 1000 : 0;
    const score = matchCount + stockBonus;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = variant;
    }
  }

  return bestMatch || getDefaultVariant(variants);
};

export const getSelectionsFromVariant = (
  variant: ProductDetailVariant | null,
  variantGroups: ProductDetailVariantGroup[],
  currentSelections: Record<string, string> = {}
): Record<string, string> => {
  if (!variant) return currentSelections;

  const selections: Record<string, string> = { ...currentSelections };

  variant.options.forEach((opt) => {
    const variantOption = opt.productVariantOption.variantOption;
    const variantGroupId = variantOption.variantGroup.id;

    const group = variantGroups.find(
      (g) => g.variantGroup.id === variantGroupId
    );
    const groupSlug = group?.variantGroup.translations[0]?.slug;
    const optionSlug = variantOption.translations[0]?.slug;

    if (groupSlug && optionSlug) {
      selections[groupSlug] = optionSlug;
    }
  });

  return selections;
};
