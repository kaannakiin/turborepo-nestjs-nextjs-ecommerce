import { Module } from '@nestjs/common';
import { LocaleModule } from 'src/common/services/locale/locale.module';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService],
  imports: [LocaleModule],
})
export class BrandsModule {}
