import { Module } from '@nestjs/common';
import { CartV2Service } from './cart-v2.service';
import { CartV2Controller } from './cart-v2.controller';

@Module({
  controllers: [CartV2Controller],
  providers: [CartV2Service],
})
export class CartV2Module {}
