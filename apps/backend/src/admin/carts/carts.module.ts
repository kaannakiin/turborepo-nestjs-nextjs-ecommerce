import { Module } from '@nestjs/common';
import { LocaleModule } from 'src/common/services/locale/locale.module';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  controllers: [CartsController],
  providers: [CartsService],
  imports: [LocaleModule],
})
export class CartsModule {}
