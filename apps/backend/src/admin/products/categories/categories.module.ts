import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [],
})
export class CategoriesModule {}
