import { Module } from '@nestjs/common';
import { CartItemValidationService } from './cart-item-validation.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, CartItemValidationService],
})
export class CartModule {}
