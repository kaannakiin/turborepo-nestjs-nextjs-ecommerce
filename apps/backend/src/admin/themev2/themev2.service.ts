import { Injectable } from '@nestjs/common';
import { AssetType, Prisma } from '@repo/database';
import {
  productQueryInclude,
  ProductSelectResult,
  ProductWithPayload,
  SearchableProductModalResponseType,
  variantQueryInclude,
  VariantWithPayload,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class Themev2Service {
  constructor(private prismaService: PrismaService) {}

  private mapProductToResult(product: ProductWithPayload): ProductSelectResult {
    const parentName =
      product.translations?.[0]?.name || product.sku || 'No Name';
    const assetRecord = product.assets?.[0];
    const image = assetRecord?.asset;

    const childrenVariants: ProductSelectResult[] =
      product.variantCombinations?.map((variant) => {
        return this.mapVariantToResult(
          variant as VariantWithPayload,
          parentName,
        );
      }) || [];

    return {
      id: product.id,
      name: parentName,
      isVariant: product.isVariant,
      sku: product.sku,
      stock: product.stock,
      image: image
        ? { url: image.url, type: image.type as AssetType }
        : undefined,
      variantCombinations: [],
      variants: childrenVariants,
    };
  }

  private mapVariantToResult(
    variant: VariantWithPayload,
    overrideParentName?: string,
  ): ProductSelectResult {
    const parentName =
      overrideParentName || variant.product?.translations?.[0]?.name || '';

    const variantAttributes =
      variant.options?.map((opt) => {
        const pvo = opt.productVariantOption;

        const groupName =
          pvo.productVariantGroup.variantGroup.translations?.[0]?.name ||
          'Group';
        const optionName =
          pvo.variantOption.translations?.[0]?.name || 'Option';
        const optionValue =
          pvo.variantOption.translations?.[0]?.name ||
          pvo.variantOption.hexValue ||
          '';

        return {
          variantId: variant.id,
          variantGroupId: pvo.productVariantGroup.variantGroupId,
          variantGroupName: groupName,
          variantOptionId: pvo.variantOptionId,
          variantOptionName: optionName,
          variantOptionValue: optionValue,

          _displayName: `${groupName}: ${optionValue}`,
        };
      }) || [];

    const variantSuffix = variantAttributes
      .map((attr) => attr._displayName)
      .join(' | ');
    const fullName = variantSuffix
      ? `${parentName} - ${variantSuffix}`
      : parentName;

    let imageUrl: string | undefined;
    let imageType: AssetType | undefined;

    if (variant.assets?.[0]?.asset) {
      imageUrl = variant.assets[0].asset.url;
      imageType = variant.assets[0].asset.type as AssetType;
    } else if (variant.product?.assets?.[0]?.asset) {
      imageUrl = variant.product.assets[0].asset.url;
      imageType = variant.product.assets[0].asset.type as AssetType;
    }

    const cleanedAttributes = variantAttributes.map(
      ({ _displayName, ...rest }) => rest,
    );

    return {
      id: variant.id,
      name: fullName,
      isVariant: true,
      sku: variant.sku,
      stock: variant.stock,
      variantCombinations: cleanedAttributes,
      image:
        imageUrl && imageType ? { url: imageUrl, type: imageType } : undefined,
      variants: [],
    };
  }

  async getProducts({
    initialIds = [],
    search,
    page = 1,
    limit = 12,
  }: {
    search?: string;
    initialIds?: { id: string; isVariant: boolean }[];
    page?: number;
    limit?: number;
  }): Promise<SearchableProductModalResponseType> {
    const initialProductIds = initialIds
      .filter((x) => !x.isVariant)
      .map((x) => x.id);
    const initialVariantIds = initialIds
      .filter((x) => x.isVariant)
      .map((x) => x.id);

    let selectedItems: ProductSelectResult[] = [];

    if (page === 1 && initialIds.length > 0) {
      const [products, variants] = await Promise.all([
        this.prismaService.product.findMany({
          where: { id: { in: initialProductIds } },
          include: productQueryInclude,
        }),
        this.prismaService.productVariantCombination.findMany({
          where: { id: { in: initialVariantIds } },
          include: variantQueryInclude,
        }),
      ]);

      selectedItems = [
        ...products.map((p) => this.mapProductToResult(p)),
        ...variants.map((v) => this.mapVariantToResult(v)),
      ];
    }

    const whereClause: Prisma.ProductWhereInput = {
      active: true,
      id: { notIn: initialProductIds },
    };

    if (search) {
      whereClause.OR = [
        {
          translations: {
            some: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await this.prismaService.$transaction([
      this.prismaService.product.count({ where: whereClause }),
      this.prismaService.product.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        include: productQueryInclude,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mappedProducts = products.map((p) => this.mapProductToResult(p));

    return {
      success: true,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },

      selectedData: selectedItems,
      data: mappedProducts,
    };
  }
}
