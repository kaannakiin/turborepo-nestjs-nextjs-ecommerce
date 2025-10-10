import { Module } from '@nestjs/common';
import { UserPageService } from './user-page.service';
import { UserPageController } from './user-page.controller';
import { ProductsModule } from './products/products.module';
import { OrderModule } from './order/order.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  controllers: [UserPageController],
  providers: [UserPageService],
  imports: [ProductsModule, OrderModule, CategoriesModule],
})
export class UserPageModule {}
