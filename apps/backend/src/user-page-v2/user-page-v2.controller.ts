import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  GetCategoryProductsSchema,
  type GetCategoryProductsZodType,
} from '@repo/types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { UserPageV2Service } from './user-page-v2.service';

@Controller('user-page-v2')
export class UserPageV2Controller {
  constructor(private readonly userPageV2Service: UserPageV2Service) {}

  @Get('get-category/:slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.userPageV2Service.getCategoryBySlug(slug, 'TR');
  }

  @Post(`get-category-products`)
  async getCategoryProducts(
    @Body(new ZodValidationPipe(GetCategoryProductsSchema))
    data: GetCategoryProductsZodType,
  ) {
    return this.userPageV2Service.getCategoryProducts(data);
  }
}
