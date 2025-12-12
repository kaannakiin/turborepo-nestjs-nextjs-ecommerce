import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AssetType, Prisma } from '@repo/database';
import {
  ProductCarouselComponentInputType,
  ProductCart,
  productQueryInclude,
  productQueryIncludeV2,
  ProductSelectResult,
  ProductWithPayload,
  SearchableProductModalResponseType,
  variantQueryIncludeV2,
  VariantWithPayload,
} from '@repo/types';
import { ProductMapService } from 'src/common/services/product-map.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class Themev2Service {
  constructor(
    private prismaService: PrismaService,
    private productMapService: ProductMapService,
  ) {}

  private mapProductToResult(product: ProductWithPayload): ProductSelectResult {
    const parentName =
      product.translations?.[0]?.name || product.sku || 'No Name';

    const assetRecord = product.assets?.[0];
    const parentImage = assetRecord?.asset
      ? {
          url: assetRecord.asset.url,
          type: assetRecord.asset.type as AssetType,
        }
      : undefined;

    const childrenVariants: ProductSelectResult[] =
      product.variantCombinations?.map((variant) => {
        return this.mapVariantToResult(
          variant as VariantWithPayload,
          parentName,
          parentImage,
        );
      }) || [];

    return {
      id: product.id,
      name: parentName,
      isVariant: false,
      sku: product.sku,
      stock: product.stock,
      image: parentImage,
      variantCombinations: [],
      variants: childrenVariants,
    };
  }

  private mapVariantToResult(
    variant: VariantWithPayload,
    parentName: string,
    parentImage?: { url: string; type: AssetType },
  ): ProductSelectResult {
    const variantAttributes =
      variant.options?.map((opt) => {
        const pvo = opt.productVariantOption;
        const variantOption = pvo.variantOption;
        const variantGroup = variantOption.variantGroup;
        const groupName = variantGroup.translations?.[0]?.name || 'Group';

        const optionName = variantOption.translations?.[0]?.name || 'Option';

        const optionValue =
          variantOption.translations?.[0]?.name || variantOption.hexValue || '';

        return {
          variantId: variant.id,

          variantGroupId: variantGroup.id,
          variantGroupName: groupName,
          variantOptionId: variantOption.id,
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

    let image = parentImage;

    if (variant.assets?.[0]?.asset) {
      image = {
        url: variant.assets[0].asset.url,
        type: variant.assets[0].asset.type as AssetType,
      };
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
      image: image,
      variants: [],
    };
  }

  async getProducts({
    search,
    page = 1,
    limit = 12,
  }: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchableProductModalResponseType> {
    const whereClause: Prisma.ProductWhereInput = {
      active: true,
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
      data: mappedProducts,
    };
  }

  async carouselProducts(
    productIds: string[],
    variantIds: string[],
  ): Promise<{
    success: boolean;
    products: ProductCart[];
    variants: ProductCart[];
  }> {
    try {
      const [products, variants] = await Promise.all([
        this.prismaService.product.findMany({
          where: { id: { in: productIds }, active: true, stock: { gt: 0 } },
          include: productQueryIncludeV2,
        }),
        this.prismaService.productVariantCombination.findMany({
          where: {
            active: true,
            stock: { gt: 0 },
            id: { in: variantIds },
            product: {
              active: true,
            },
          },
          include: variantQueryIncludeV2,
        }),
      ]);

      return {
        success: true,
        products: this.productMapService.produtMap(products),
        variants: this.productMapService.variantMap(variants),
      };
    } catch (error) {
      console.error('Error in carouselProducts:', error);
      throw new InternalServerErrorException(
        'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyiniz.',
      );
    }
  }
}
