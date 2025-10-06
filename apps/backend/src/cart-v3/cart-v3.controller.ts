import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { type User } from '@repo/database';
import { AddCartReqBodyV3Schema, type AddCartReqBodyV3Type } from '@repo/types';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CartV3Service } from './cart-v3.service';

@Controller('cart-v3')
export class CartV3Controller {
  constructor(private readonly cartV3Service: CartV3Service) {}

  @Post('add-item')
  @UseGuards(OptionalJwtAuthGuard)
  async addItemToCart(
    @Body(new ZodValidationPipe(AddCartReqBodyV3Schema))
    data: AddCartReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.addItemToCart(data, user);
  }

  @Get(':cartId')
  @UseGuards(OptionalJwtAuthGuard)
  async getCartById(
    @Param('cartId') cartId: string,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.getCartForClient(user ? user.id : null, cartId);
  }
}
