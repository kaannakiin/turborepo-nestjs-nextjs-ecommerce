import { BadRequestException, Injectable } from '@nestjs/common';
import { Locale } from '@repo/database';
import { filterReservedKeys, ProductPageSortOption } from '@repo/shared';
import {
  BrandNode,
  BrandPageFilters,
  BrandProductsResponse,
  FiltersResponse,
  ParsedFilters,
} from '@repo/types';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { LocaleService } from 'src/common/services/locale.service';
import { ProductViewService } from 'src/common/services/product-view.service';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly currencyLocaleService: CurrencyLocaleService,
    private readonly productViewService: ProductViewService,
  ) {}

  async getBrandProducts(
    slug: string,
    filters: BrandPageFilters,
  ): Promise<BrandProductsResponse> {
    const locale = this.localeService.getLocale();
    const currency = this.currencyLocaleService.getCurrencyLocaleMap(locale);

    const { brandNode, allBrandIds } = await this.getBrandMetadata(
      slug,
      locale,
    );
    const parsedFilters = this.parseFilters(filters);

    const productResult = await this.productViewService.getProducts(
      {
        brandIds: allBrandIds,
        categorySlugs: parsedFilters.categorySlugs,
        tagSlugs: parsedFilters.tagSlugs,
        variantFilters: parsedFilters.variantFilters,
        minPrice: parsedFilters.minPrice,
        maxPrice: parsedFilters.maxPrice,
        sort: parsedFilters.sort,
        page: parsedFilters.page,
        limit: parsedFilters.limit,
      },
      currency,
    );

    const products = await this.productViewService.getProductDetails(
      productResult.items,
      locale,
    );

    return {
      brand: brandNode,
      products,
      pagination: productResult.pagination,
    };
  }

  async getBrandFilters(
    slug: string,
    filters: Omit<BrandPageFilters, 'sort' | 'page' | 'limit'>,
  ): Promise<FiltersResponse> {
    const locale = this.localeService.getLocale();
    const currency = this.currencyLocaleService.getCurrencyLocaleMap(locale);

    const { allBrandIds } = await this.getBrandMetadata(slug, locale);

    const parsedFilters = this.parseFilters({
      ...filters,
      sort: ProductPageSortOption.NEWEST,
      page: 1,
      limit: 1,
    });

    const baseWhere = this.productViewService.buildBaseWhere(currency, {
      brandIds: allBrandIds,
    });

    const where = this.productViewService.applyFiltersToWhere(
      baseWhere,
      parsedFilters,
    );

    return this.productViewService.getAvailableFilters(
      where,
      parsedFilters,
      currency,
      locale,
      {
        includeBrands: false,
        includeTags: true,
        includeCategories: true,
        includeVariants: true,
      },
    );
  }

  private async getBrandMetadata(
    slug: string,
    locale: Locale,
  ): Promise<{ brandNode: BrandNode; allBrandIds: string[] }> {
    const brandTranslation =
      await this.prismaService.brandTranslation.findUnique({
        where: { locale_slug: { locale, slug } },
        select: { brandId: true },
      });

    if (!brandTranslation) {
      throw new BadRequestException('Aradığınız marka bulunamadı.');
    }

    const brandNode = await this.getBrandTree(brandTranslation.brandId, locale);

    if (!brandNode) {
      throw new BadRequestException('Marka bilgileri alınamadı.');
    }

    return {
      brandNode,
      allBrandIds: this.collectAllBrandIds(brandNode),
    };
  }

  private async getBrandTree(
    brandId: string,
    locale: Locale,
  ): Promise<BrandNode | null> {
    const brand = await this.prismaService.brand.findUnique({
      where: { id: brandId, deletedAt: null },
      select: {
        id: true,
        image: { select: { url: true } },
        translations: {
          where: { locale },
          select: {
            name: true,
            slug: true,
            description: true,
            metaTitle: true,
            metaDescription: true,
          },
        },
        parentBrand: {
          select: {
            id: true,
            image: { select: { url: true } },
            translations: {
              where: { locale },
              select: {
                name: true,
                slug: true,
                description: true,
                metaTitle: true,
                metaDescription: true,
              },
            },
          },
        },
        childBrands: {
          where: { deletedAt: null },
          select: {
            id: true,
            image: { select: { url: true } },
            translations: {
              where: { locale },
              select: {
                name: true,
                slug: true,
                description: true,
                metaTitle: true,
                metaDescription: true,
              },
            },
            childBrands: {
              where: { deletedAt: null },
              select: {
                id: true,
                image: { select: { url: true } },
                translations: {
                  where: { locale },
                  select: {
                    name: true,
                    slug: true,
                    description: true,
                    metaTitle: true,
                    metaDescription: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!brand || !brand.translations[0]) return null;

    const mapBrand = (b: typeof brand, includeParent = false): BrandNode => {
      const translation = b.translations[0];
      return {
        id: b.id,
        name: translation?.name || '',
        slug: translation?.slug || '',
        description: translation?.description || undefined,
        metaTitle: translation?.metaTitle || undefined,
        metaDescription: translation?.metaDescription || undefined,
        imageUrl: b.image?.url || undefined,
        children: [],
        parent: undefined,
      };
    };

    const mapChildren = (children: typeof brand.childBrands): BrandNode[] => {
      return children
        .filter((child) => child.translations[0])
        .map((child) => {
          const node = mapBrand(child as typeof brand);

          if ('childBrands' in child && child.childBrands) {
            node.children = (child.childBrands as typeof brand.childBrands)
              .filter((grandChild) => grandChild.translations[0])
              .map((grandChild) => mapBrand(grandChild as typeof brand));
          }
          return node;
        });
    };

    const brandNode = mapBrand(brand);
    brandNode.children = mapChildren(brand.childBrands);

    if (brand.parentBrand?.translations[0]) {
      brandNode.parent = mapBrand(brand.parentBrand as typeof brand);
    }

    return brandNode;
  }

  private collectAllBrandIds(node: BrandNode): string[] {
    const ids: string[] = [node.id];

    if (node.children?.length) {
      for (const child of node.children) {
        ids.push(...this.collectAllBrandIds(child));
      }
    }

    return ids;
  }

  private parseFilters(filters: BrandPageFilters): ParsedFilters {
    const getArray = (value: string | undefined): string[] => {
      if (!value) return [];
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    };

    const cleanVariantFilters = filterReservedKeys(filters.variantFilters);

    const variantFilters: Record<string, string[]> = {};
    Object.entries(cleanVariantFilters).forEach(([key, value]) => {
      const options = Array.isArray(value)
        ? value
        : value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);

      if (options.length > 0) {
        variantFilters[key] = options;
      }
    });

    return {
      brandSlugs: [],
      tagSlugs: getArray(filters.tags),
      categorySlugs: getArray(filters.categories),
      variantFilters,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: Math.max(1, filters.page),
      limit: Math.min(50, Math.max(1, filters.limit)),
    };
  }
}
