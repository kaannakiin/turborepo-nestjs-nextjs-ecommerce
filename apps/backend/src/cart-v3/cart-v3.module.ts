import { Module } from '@nestjs/common';
import { CartV3Service } from './cart-v3.service';
import { CartV3Controller } from './cart-v3.controller';
import { ShippingService } from 'src/shipping/shipping.service';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [CartV3Controller],
  providers: [CartV3Service, ShippingService],
  exports: [CartV3Service],
  imports: [LocaleModule],
})
export class CartV3Module {}
