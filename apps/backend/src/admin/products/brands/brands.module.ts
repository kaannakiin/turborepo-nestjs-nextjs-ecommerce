import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService],
  imports: [LocaleModule],
})
export class BrandsModule {}
