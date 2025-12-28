import { Module } from '@nestjs/common';
import { LocaleModule } from 'src/common/services/locale/locale.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [LocaleModule],
})
export class CategoriesModule {}
