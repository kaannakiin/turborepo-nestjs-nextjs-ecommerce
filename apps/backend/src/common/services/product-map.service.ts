import { Global, Injectable } from '@nestjs/common';
import {
  AssetType,
  Currency,
  Locale,
  ProductTranslation,
  VariantGroupTranslation,
  VariantGroupType,
  VariantOptionTranslation,
} from '@repo/database';
import {
  ProductCart,
  ProductMapInputType,
  VariantMapInputType,
} from '@repo/types';

@Global()
@Injectable()
export class ProductMapService {
  private getTranslation<T extends { locale: Locale }>(
    translations: T[] | undefined | null,
    targetLocale: Locale,
  ): T | undefined {
    if (!translations || !Array.isArray(translations)) return undefined;

    return translations.find((t) => t.locale === targetLocale);
  }

  private getPrice<T extends { currency: Currency }>(
    prices: T[] | undefined | null,
    currency: Currency,
  ) {
    if (!prices || !Array.isArray(prices)) return undefined;
    return prices.find((p) => p.currency === currency);
  }

  private formatImage(
    assetObj: { asset: { url: string; type: AssetType } } | null,
  ) {
    if (!assetObj?.asset) return null;
    return {
      url: assetObj.asset.url,
      type: assetObj.asset.type,
    };
  }

  public produtMap(
    data: ProductMapInputType[],
    locale: Locale = 'TR' as Locale,
    currency: Currency = 'TRY' as Currency,
  ): Array<ProductCart> {
    return data.reduce<Array<ProductCart>>((acc, product) => {
      const translation = this.getTranslation(product.translations, locale) as
        | ProductTranslation
        | undefined;
      const priceObj = this.getPrice(product.prices, currency);

      if (!translation) {
        return acc;
      }
      if (!priceObj) {
        return acc;
      }
      if (!translation.slug) {
        return acc;
      }

      const images =
        product.assets
          ?.map(this.formatImage)
          .filter(
            (img): img is { url: string; type: AssetType } => img !== null,
          ) || [];

      acc.push({
        id: product.id,
        isVariant: false,
        name: translation.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        images: images,
        price: Number(priceObj.price),
        discountPrice: priceObj.discountedPrice
          ? Number(priceObj.discountedPrice)
          : undefined,
        url: `/${translation.slug}`,
        variantOptions: undefined,
      });

      return acc;
    }, []);
  }

  public variantMap(
    data: VariantMapInputType[],
    locale: Locale = 'TR' as Locale,
    currency: Currency = 'TRY' as Currency,
  ): Array<ProductCart> {
    return data.reduce<Array<ProductCart>>((acc, variant) => {
      if (!variant.product) {
        return acc;
      }

      const productTranslation = this.getTranslation(
        variant.product.translations,
        locale,
      ) as ProductTranslation | undefined;

      const priceObj = this.getPrice(variant.prices, currency);

      if (!productTranslation) {
        return acc;
      }
      if (!priceObj) {
        return acc;
      }
      if (!productTranslation.slug) {
        return acc;
      }

      const variantOptions: ProductCart['variantOptions'] = [];
      const params = new URLSearchParams();

      if (variant.options && Array.isArray(variant.options)) {
        variant.options.forEach((opt) => {
          const variantOption = opt.productVariantOption?.variantOption;
          if (!variantOption) return;

          const variantGroup = variantOption.variantGroup;
          if (!variantGroup) return;

          const optionTrans = this.getTranslation(
            variantOption.translations,
            locale,
          ) as VariantOptionTranslation | undefined;
          const groupTrans = this.getTranslation(
            variantGroup.translations,
            locale,
          ) as VariantGroupTranslation | undefined;

          if (optionTrans && groupTrans) {
            variantOptions.push({
              optionId: variantOption.id,
              optionName: optionTrans.name,
              optionAsset: variantOption.asset
                ? {
                    url: variantOption.asset.url,
                    type: variantOption.asset.type as AssetType,
                  }
                : undefined,
              optionHexValue: variantOption.hexValue || undefined,
              optionGroupId: variantGroup.id,
              optionGroupName: groupTrans.name,
              optionGroupType: variantGroup.type as VariantGroupType,
              optionGroupRenderType:
                opt.productVariantOption.productVariantGroup
                  .renderVisibleType || 'DROPDOWN',
            });

            params.append(groupTrans.name, optionTrans.name);
          }
        });
      }

      const variantImages =
        variant.assets?.map(this.formatImage).filter(Boolean) || [];
      const productImages =
        variant.product.assets?.map(this.formatImage).filter(Boolean) || [];

      const images = [...variantImages, ...productImages];

      const baseUrl = `/${productTranslation.slug}`;
      const queryString = params.toString();
      const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      acc.push({
        id: variant.id,
        isVariant: true,
        name: productTranslation.name,
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        images: images as { url: string; type: AssetType }[],
        price: Number(priceObj.price),
        discountPrice: priceObj.discountedPrice
          ? Number(priceObj.discountedPrice)
          : undefined,
        url: finalUrl,
        variantOptions: variantOptions,
      });

      return acc;
    }, []);
  }
}
