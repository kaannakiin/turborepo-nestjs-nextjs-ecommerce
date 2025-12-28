import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, CurrencyLocaleService],
  imports: [LocaleModule],
})
export class ProductsModule {}
