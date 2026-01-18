'use client';

import {
  findBestMatchingVariant,
  getDefaultSelections,
  getDefaultVariant,
  getSelectableOptions,
  getSelectedOptionIds,
  getSelectionsFromVariant,
  getVariantSlugsFromParams,
} from '@lib/variant-helper';
import { ProductDetailType } from '@repo/types';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseVariantSelectionProps {
  product: ProductDetailType | undefined;
}

export const useVariantSelection = ({ product }: UseVariantSelectionProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const variants = useMemo(() => product?.variants ?? [], [product?.variants]);
  const variantGroups = useMemo(
    () => product?.variantGroups ?? [],
    [product?.variantGroups],
  );

  const [selectedSlugs, setSelectedSlugs] = useState<Record<string, string>>(
    () => {
      const urlSlugs = getVariantSlugsFromParams(searchParams, variantGroups);
      if (Object.keys(urlSlugs).length > 0) return urlSlugs;

      const defaultVariant = getDefaultVariant(variants);
      return getDefaultSelections(defaultVariant, variantGroups);
    },
  );

  const selectedOptionIds = useMemo(() => {
    return getSelectedOptionIds(selectedSlugs, variantGroups);
  }, [selectedSlugs, variantGroups]);

  const selectedVariant = useMemo(() => {
    return findBestMatchingVariant(selectedOptionIds, variants, variantGroups);
  }, [selectedOptionIds, variants, variantGroups]);

  useEffect(() => {
    if (!selectedVariant || variants.length === 0) return;

    const variantOptionIds = selectedVariant.options.map(
      (opt) => opt.productVariantOption.variantOption.id,
    );

    const allSelectionsMatch = Object.values(selectedOptionIds).every((id) =>
      variantOptionIds.includes(id),
    );

    if (!allSelectionsMatch) {
      const correctedSlugs = getSelectionsFromVariant(
        selectedVariant,
        variantGroups,
        selectedSlugs,
      );

      setSelectedSlugs(correctedSlugs);

      const newParams = new URLSearchParams();
      Object.entries(correctedSlugs).forEach(([key, value]) => {
        newParams.set(key, value);
      });
      window.history.replaceState(
        null,
        '',
        `${pathname}?${newParams.toString()}`,
      );
    }
  }, [
    selectedVariant,
    selectedOptionIds,
    variantGroups,
    selectedSlugs,
    pathname,
    variants.length,
  ]);

  const selectableOptions = useMemo(() => {
    return getSelectableOptions(selectedOptionIds, variantGroups, variants);
  }, [selectedOptionIds, variantGroups, variants]);

  const selectOption = useCallback(
    (groupSlug: string, optionSlug: string) => {
      setSelectedSlugs((prev) => ({
        ...prev,
        [groupSlug]: optionSlug,
      }));

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set(groupSlug, optionSlug);
      window.history.replaceState(
        null,
        '',
        `${pathname}?${newParams.toString()}`,
      );
    },
    [pathname, searchParams],
  );

  const isOptionSelected = useCallback(
    (groupSlug: string, optionSlug: string) => {
      return selectedSlugs[groupSlug] === optionSlug;
    },
    [selectedSlugs],
  );

  const isOptionSelectable = useCallback(
    (groupId: string, optionId: string) => {
      return selectableOptions[groupId]?.includes(optionId) ?? false;
    },
    [selectableOptions],
  );

  const price =
    selectedVariant?.prices[0]?.discountedPrice ??
    selectedVariant?.prices[0]?.price ??
    null;

  const originalPrice = selectedVariant?.prices[0]?.discountedPrice
    ? selectedVariant.prices[0].price
    : null;

  const discountPercentage =
    originalPrice && price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const stock = selectedVariant?.stock ?? 0;
  const isInStock = stock > 0;

  return {
    selectedVariant,
    selectedSlugs,
    selectedOptionIds,
    selectableOptions,
    selectOption,
    isOptionSelected,
    isOptionSelectable,
    price,
    originalPrice,
    discountPercentage,
    stock,
    isInStock,
  };
};
