import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { getParamKey, filterReservedKeys } from '@repo/shared';
import { BrandsService } from './brands.service';
import { ParseSortOptionPipe } from 'src/common/pipes/product-sort-option.pipe';
import { ProductPageSortOption } from '@repo/types';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get('/:slug')
  async getBrandProducts(
    @Param('slug') slug: string,
    @Query(getParamKey('sort'), ParseSortOptionPipe)
    sort: ProductPageSortOption = ProductPageSortOption.NEWEST,
    @Query(getParamKey('page'), new ParseIntPipe({ optional: true }))
    page: number = 1,
    @Query(getParamKey('limit'), new ParseIntPipe({ optional: true }))
    limit: number = 12,
    @Query(getParamKey('minPrice'), new ParseIntPipe({ optional: true }))
    minPrice?: number,
    @Query(getParamKey('maxPrice'), new ParseIntPipe({ optional: true }))
    maxPrice?: number,
    @Query(getParamKey('tags')) tags?: string,
    @Query(getParamKey('categories')) categories?: string,
    @Query() allQuery?: Record<string, string | string[]>,
  ) {
    const variantFilters = filterReservedKeys(allQuery ?? {});

    return this.brandsService.getBrandProducts(slug, {
      sort,
      page,
      limit,
      minPrice,
      maxPrice,
      tags,
      categories,
      variantFilters,
    });
  }

  @Get('/:slug/filters')
  async getBrandFilters(
    @Param('slug') slug: string,
    @Query(getParamKey('minPrice'), new ParseIntPipe({ optional: true }))
    minPrice?: number,
    @Query(getParamKey('maxPrice'), new ParseIntPipe({ optional: true }))
    maxPrice?: number,
    @Query(getParamKey('tags')) tags?: string,
    @Query(getParamKey('categories')) categories?: string,
    @Query() allQuery?: Record<string, string | string[]>,
  ) {
    const variantFilters = filterReservedKeys(allQuery ?? {});

    return this.brandsService.getBrandFilters(slug, {
      minPrice,
      maxPrice,
      tags,
      categories,
      variantFilters,
    });
  }
}
