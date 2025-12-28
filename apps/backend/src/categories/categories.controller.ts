import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ProductPageSortOption,
  getParamKey,
  filterReservedKeys,
} from '@repo/shared';
import { CategoriesService } from './categories.service';
import { ParseSortOptionPipe } from 'src/common/pipes/product-sort-option.pipe';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/:slug')
  async getCategoryProducts(
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
    @Query(getParamKey('brands')) brands?: string,
    @Query(getParamKey('categories')) categories?: string,
    @Query() allQuery?: Record<string, string | string[]>,
  ) {
    const variantFilters = filterReservedKeys(allQuery ?? {});
    const result = await this.categoriesService.getCategoryProducts(slug, {
      sort,
      page,
      limit,
      minPrice,
      maxPrice,
      tags,
      brands,
      categories,
      variantFilters,
    });

    return result;
  }

  @Get('/:slug/filters')
  async getCategoryFilters(
    @Param('slug') slug: string,
    @Query(getParamKey('minPrice'), new ParseIntPipe({ optional: true }))
    minPrice?: number,
    @Query(getParamKey('maxPrice'), new ParseIntPipe({ optional: true }))
    maxPrice?: number,
    @Query(getParamKey('tags')) tags?: string,
    @Query(getParamKey('brands')) brands?: string,
    @Query(getParamKey('categories')) categories?: string,
    @Query() allQuery?: Record<string, string | string[]>,
  ) {
    const variantFilters = filterReservedKeys(allQuery ?? {});

    const result = await this.categoriesService.getCategoryFilters(slug, {
      minPrice,
      maxPrice,
      tags,
      brands,
      categories,
      variantFilters,
    });

    return result;
  }
}
