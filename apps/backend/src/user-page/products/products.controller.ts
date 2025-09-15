import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('/users/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('get-product/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Get('similar-products/:productId')
  getSimilarProducts(@Param('productId') productId: string) {
    return this.productsService.getProductSimilar(productId);
  }
}
