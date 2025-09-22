//apps/backend/src/admin/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { GoogleCategoriesModule } from './google-categories/google-categories.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [BrandsModule, CategoriesModule, GoogleCategoriesModule],
  exports: [ProductsService],
})
export class ProductsModule {}
