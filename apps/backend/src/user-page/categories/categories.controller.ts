import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('/users/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('get-category-page/:slug')
  async getCategoryPage(
    @Param('slug') slug: string,
    @Query() allParams: Record<string, string | string[]>,
  ) {
    return this.categoriesService.getCategoryPage(slug, allParams);
  }

  @Get('get-products-categories/:categoryId')
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query() allParams: Record<string, string | string[]>,
  ) {
    const { page: pageParam, sort: sortParam, ...otherParams } = allParams;

    const page = parseInt((pageParam as string) || '1', 10);
    const sort = parseInt((sortParam as string) || '0', 10);
    return this.categoriesService.getProductsByCategory({
      categoryId,
      page,
      sort,
      otherParams,
    });
  }
}
