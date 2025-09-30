import { Module } from '@nestjs/common';
import { CartV2Controller } from './cart-v2.controller';
import { CartV2Service } from './cart-v2.service';

@Module({
  controllers: [CartV2Controller],
  providers: [CartV2Service],
  exports: [CartV2Service],
  imports: [],
})
export class CartV2Module {}
