import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { VariantsModule } from './variants/variants.module';
import { GoogleCategoriesModule } from './google-categories/google-categories.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [BrandsModule, CategoriesModule, TagsModule, VariantsModule, GoogleCategoriesModule],
})
export class ProductsModule {}
