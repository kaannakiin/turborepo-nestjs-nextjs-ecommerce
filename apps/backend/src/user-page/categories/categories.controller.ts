import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  GetCategoryProductsSchema,
  type GetCategoryProductsZodType,
} from '@repo/types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CategoriesService } from './categories.service';

@Controller('user-categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get('get-category/:slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.categoriesService.getCategoryBySlug(slug, 'TR');
  }

  @HttpCode(HttpStatus.OK)
  @Post(`get-category-products`)
  async getCategoryProducts(
    @Body(new ZodValidationPipe(GetCategoryProductsSchema))
    data: GetCategoryProductsZodType,
  ) {
    return this.categoriesService.getCategoryProducts(data);
  }
}
