import { Module } from '@nestjs/common';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ProductViewService } from 'src/common/services/product-view.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CurrencyLocaleService, ProductViewService],
  imports: [],
})
export class CategoriesModule {}
