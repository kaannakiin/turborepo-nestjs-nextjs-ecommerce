import { Module } from '@nestjs/common';
import { CartV3Service } from './cart-v3.service';
import { CartV3Controller } from './cart-v3.controller';
import { ShippingService } from 'src/shipping/shipping.service';

@Module({
  controllers: [CartV3Controller],
  providers: [CartV3Service, ShippingService],
  exports: [CartV3Service],
})
export class CartV3Module {}
