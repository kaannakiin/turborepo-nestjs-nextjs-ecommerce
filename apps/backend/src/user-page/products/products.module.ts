//apps/backend/src/user-page/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsService as AdminProductService } from '../../admin/products/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, AdminProductService],
})
export class ProductsModule {}
