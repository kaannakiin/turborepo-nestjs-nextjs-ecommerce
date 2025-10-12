import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductListComponentSchema,
  ProductListComponentType,
} from '@repo/types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('/users/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('get-product/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug, 'TR');
  }

  @Get('similar-products/:productId')
  getSimilarProducts(@Param('productId') productId: string) {
    return this.productsService.getProductSimilar(productId);
  }

  @Post('get-products-by-ids-for-product-list-carousel')
  @UsePipes(
    new ZodValidationPipe(
      ProductListComponentSchema.pick({
        items: true,
      }),
    ),
  )
  getProductsByIdsForProductListCarousel(
    @Body() body: { items: ProductListComponentType['items'] }, // ✅ Tam object tipini belirtin
  ) {
    return this.productsService.getProductsByIdsForProductListCarousel(
      body.items,
    );
  }
}
