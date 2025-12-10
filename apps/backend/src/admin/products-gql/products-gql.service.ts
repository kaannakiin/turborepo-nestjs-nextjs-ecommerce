import { Injectable } from '@nestjs/common';
import { Currency, Locale, Prisma } from '@repo/database';
import { adminProductFindAllProductQuery, ProductSortField } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminProductsResponseGql } from './dto/product.model';
import {
  ProductsFilterInput,
  ProductSortInput,
} from './dto/products-filter.input';

@Injectable()
export class ProductsGqlService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: ProductsFilterInput | null | undefined,
    sort: ProductSortInput | undefined,
    page: number,
    limit: number,
    locale: Locale,
  ): Promise<AdminProductsResponseGql> {
    const safeFilter = filter || {};

    const skip = (page - 1) * limit;
    const currency = safeFilter.priceRange?.currency || Currency.TRY;

    const { ids, total } = await this.getFilteredProductIds(
      safeFilter,
      sort,
      skip,
      limit,
      locale,
      currency,
    );

    if (ids.length === 0) {
      return {
        items: [],
        success: false,
      };
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: adminProductFindAllProductQuery,
    });

    const sortedProducts = ids.map((id) => products.find((p) => p.id === id)!);

    return {
      items: sortedProducts,
      success: true,
      pagination: {
        totalCount: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  private async getFilteredProductIds(
    filter: ProductsFilterInput,
    sort: ProductSortInput | undefined,
    skip: number,
    take: number,
    locale: Locale,
    currency: Currency,
  ) {
    const conditions: Prisma.Sql[] = [];

    conditions.push(Prisma.sql`p.active = ${filter.isActive ?? true}`);

    if (filter.priceRange) {
      const { min, max } = filter.priceRange;
      const minVal = min ?? 0;
      const maxVal = max ?? 999999999;

      conditions.push(Prisma.sql`
        (
          (
            p."isVariant" = false 
            AND EXISTS (
              SELECT 1 FROM "ProductPrice" pp 
              WHERE pp."productId" = p.id 
              AND pp.currency = ${currency}::"Currency" 
              AND COALESCE(pp."discountedPrice", pp.price) BETWEEN ${minVal} AND ${maxVal}
            )
          )
          OR
          (
            p."isVariant" = true 
            AND EXISTS (
              SELECT 1 FROM "ProductVariantCombination" pvc
              JOIN "ProductPrice" ppv ON ppv."combinationId" = pvc.id
              WHERE pvc."productId" = p.id 
              AND pvc.active = true 
              AND ppv.currency = ${currency}::"Currency" 
              AND COALESCE(ppv."discountedPrice", ppv.price) BETWEEN ${minVal} AND ${maxVal}
            )
          )
        )
      `);
    }

    if (filter.search) {
      const search = `%${filter.search.trim()}%`;
      conditions.push(Prisma.sql`
        (
          EXISTS (SELECT 1 FROM "ProductTranslation" pt WHERE pt."productId" = p.id AND pt.name ILIKE ${search}) OR
          p.sku ILIKE ${search} OR
          p.barcode ILIKE ${search} OR
          EXISTS (SELECT 1 FROM "ProductVariantCombination" pvc WHERE pvc."productId" = p.id AND (pvc.sku ILIKE ${search} OR pvc.barcode ILIKE ${search}))
        )
      `);
    }

    if (filter.categoryIds?.length) {
      conditions.push(
        Prisma.sql`EXISTS (SELECT 1 FROM "ProductCategory" pc WHERE pc."productId" = p.id AND pc."categoryId" IN (${Prisma.join(filter.categoryIds)}))`,
      );
    }
    if (filter.brandIds?.length) {
      conditions.push(
        Prisma.sql`p."brandId" IN (${Prisma.join(filter.brandIds)})`,
      );
    }
    if (filter.hasStock) {
      conditions.push(
        Prisma.sql`(p.stock > 0 OR EXISTS (SELECT 1 FROM "ProductVariantCombination" pvc WHERE pvc."productId" = p.id AND pvc.stock > 0))`,
      );
    }
    if (filter.attributes?.length) {
      for (const attr of filter.attributes) {
        if (attr.optionIds?.length) {
          conditions.push(Prisma.sql`
            EXISTS (
              SELECT 1 FROM "ProductVariantCombination" pvc
              JOIN "ProductVariantCombinationOption" pvco ON pvco."combinationId" = pvc.id
              JOIN "ProductVariantOption" pvo ON pvo.id = pvco."productVariantOptionId"
              WHERE pvc."productId" = p.id 
              AND pvo."variantOptionId" IN (${Prisma.join(attr.optionIds)})
            )
          `);
        }
      }
    }

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    let orderByClause = Prisma.sql`ORDER BY p."createdAt" DESC`;

    if (sort) {
      if (sort.field === ProductSortField.PRICE) {
        orderByClause = Prisma.sql`
          ORDER BY (
            COALESCE(
              (SELECT MIN(COALESCE(ppv."discountedPrice", ppv.price)) 
               FROM "ProductVariantCombination" pvc 
               JOIN "ProductPrice" ppv ON ppv."combinationId" = pvc.id 
               WHERE pvc."productId" = p.id AND pvc.active = true AND ppv.currency = ${currency}::"Currency"),
              
              (SELECT COALESCE(pp."discountedPrice", pp.price) 
               FROM "ProductPrice" pp 
               WHERE pp."productId" = p.id AND pp.currency = ${currency}::"Currency" LIMIT 1),
               
              0
            )
          ) ${Prisma.sql([sort.order])}
        `;
      } else if (sort.field === ProductSortField.NAME) {
        orderByClause = Prisma.sql`
          ORDER BY (
            SELECT name FROM "ProductTranslation" pt 
            WHERE pt."productId" = p.id AND pt.locale = ${locale}::"Locale" 
            LIMIT 1
          ) ${Prisma.sql([sort.order])}
        `;
      } else if (sort.field === ProductSortField.STOCK) {
        orderByClause = Prisma.sql`
          ORDER BY (p.stock + (SELECT COALESCE(SUM(stock), 0) FROM "ProductVariantCombination" WHERE "productId" = p.id)) ${Prisma.sql([sort.order])}
        `;
      } else {
        orderByClause = Prisma.sql`ORDER BY p."${Prisma.raw(sort.field)}" ${Prisma.sql([sort.order])}`;
      }
    }

    const countQuery = Prisma.sql`SELECT COUNT(p.id) as total FROM "Product" p ${whereClause}`;
    const idsQuery = Prisma.sql`SELECT p.id FROM "Product" p ${whereClause} ${orderByClause} LIMIT ${take} OFFSET ${skip}`;

    const [countResult, productsResult] = await Promise.all([
      this.prisma.$queryRaw<[{ total: bigint }]>(countQuery),
      this.prisma.$queryRaw<{ id: string }[]>(idsQuery),
    ]);

    return {
      ids: productsResult.map((r) => r.id),
      total: Number(countResult[0]?.total || 0),
    };
  }
}
