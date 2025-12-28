import { Module } from '@nestjs/common';
import { LocaleModule } from 'src/common/services/locale/locale.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [LocaleModule],
})
export class ProductsModule {}
