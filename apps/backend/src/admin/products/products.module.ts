import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [BrandsModule, CategoriesModule],
})
export class ProductsModule {}
