import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  CATEGORY_PAGE_BRANDS_KEY_NAME,
  CATEGORY_PAGE_PRODUCT_TAGS_KEY_NAME,
  ProductPageSortOption,
} from '@repo/shared';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/:slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
    @Query('sort', new ParseEnumPipe(ProductPageSortOption, { optional: true }))
    sort: ProductPageSortOption = ProductPageSortOption.NEWEST,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 24,
    @Query('minPrice', new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseIntPipe({ optional: true })) maxPrice?: number,
    @Query(CATEGORY_PAGE_PRODUCT_TAGS_KEY_NAME) tags?: string,
    @Query(CATEGORY_PAGE_BRANDS_KEY_NAME) brands?: string,
    @Query() query?: Record<string, string | string[]>,
  ) {
    return this.categoriesService.getCategoryPageBySlug(slug, {
      sort,
      page,
      limit,
      minPrice,
      maxPrice,
      tags,
      brands,
      variantFilters: query ?? {},
    });
  }
}
