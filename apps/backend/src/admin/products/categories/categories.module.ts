import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [LocaleModule],
})
export class CategoriesModule {}
