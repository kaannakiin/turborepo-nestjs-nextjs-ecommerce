import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':slug')
  async getProductPage(@Param('slug') slug: string) {
    return this.productsService.getProductPage(slug);
  }
}
