import { Module } from '@nestjs/common';
import { CartV2Controller } from './cart-v2.controller';
import { CartV2Service } from './cart-v2.service';
import { ShippingService } from 'src/shipping/shipping.service';

@Module({
  controllers: [CartV2Controller],
  providers: [CartV2Service, ShippingService],
  exports: [CartV2Service],
})
export class CartV2Module {}
