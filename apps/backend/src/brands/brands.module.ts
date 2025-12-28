import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { ProductViewService } from 'src/common/services/product-view.service';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, CurrencyLocaleService, ProductViewService],
})
export class BrandsModule {}
