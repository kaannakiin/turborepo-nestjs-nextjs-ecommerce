import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, CurrencyLocaleService],
})
export class ProductsModule {}
