import { Module } from '@nestjs/common';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { LocaleModule } from 'src/common/services/locale/locale.module';
import { ProductViewService } from 'src/common/services/product-view.service';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, CurrencyLocaleService, ProductViewService],
  imports: [LocaleModule],
})
export class BrandsModule {}
