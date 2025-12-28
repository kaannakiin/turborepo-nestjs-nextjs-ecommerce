import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { LocaleService } from 'src/common/services/locale.service';

@Module({
  controllers: [CartsController],
  providers: [CartsService, LocaleService],
})
export class CartsModule {}
