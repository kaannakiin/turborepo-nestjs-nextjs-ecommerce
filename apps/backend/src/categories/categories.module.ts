import { Module } from '@nestjs/common';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ProductViewService } from 'src/common/services/product-view.service';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CurrencyLocaleService, ProductViewService],
  imports: [LocaleModule],
})
export class CategoriesModule {}
