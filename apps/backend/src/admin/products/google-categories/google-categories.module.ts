import { Module } from '@nestjs/common';
import { GoogleCategoriesService } from './google-categories.service';
import { GoogleCategoriesController } from './google-categories.controller';

@Module({
  controllers: [GoogleCategoriesController],
  providers: [GoogleCategoriesService],
})
export class GoogleCategoriesModule {}
