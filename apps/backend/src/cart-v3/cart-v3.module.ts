import { Module } from '@nestjs/common';
import { CartV3Service } from './cart-v3.service';
import { CartV3Controller } from './cart-v3.controller';

@Module({
  controllers: [CartV3Controller],
  providers: [CartV3Service],
})
export class CartV3Module {}
