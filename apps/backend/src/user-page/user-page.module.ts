import { Module } from '@nestjs/common';
import { UserPageService } from './user-page.service';
import { UserPageController } from './user-page.controller';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  controllers: [UserPageController],
  providers: [UserPageService],
  imports: [ProductsModule, CategoriesModule],
})
export class UserPageModule {}
