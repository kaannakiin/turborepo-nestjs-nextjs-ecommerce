import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { type User } from '@repo/database';
import {
  type AddItemToCartV2,
  AddItemToCartV2Schema,
  ItemIdOnlySchema,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CartV2Service } from './cart-v2.service';

@Controller('cart-v2')
export class CartV2Controller {
  constructor(private readonly cartV2Service: CartV2Service) {}

  //TODO LOCALE AND CURRENCY GELECEK VE CART'A AKTARILACAK ONA GÖRE FİYATLANDIRMA YAPILACAK
  @Get('get-cart-v2/:cartId')
  async getCart(@Param('cartId') cartId: string) {
    return this.cartV2Service.getCartForContext(cartId);
  }
  @UseGuards(OptionalJwtAuthGuard)
  @Post('add-item')
  async addItemToCart(
    @Body(new ZodValidationPipe(AddItemToCartV2Schema)) body: AddItemToCartV2,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV2Service.addItemToCart(
      body.cartId || undefined,
      body,
      user?.id,
    );
  }

  @Post('increase-item-quantity/:cartId')
  async increaseItemQuantity(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(ItemIdOnlySchema)) body: { itemId: string },
  ) {
    return this.cartV2Service.incrementItemQuantity(cartId, body.itemId);
  }

  @Post('decrease-item-quantity/:cartId')
  async decreaseItemQuantity(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(ItemIdOnlySchema)) body: { itemId: string },
  ) {
    return this.cartV2Service.decrementItemQuantity(cartId, body.itemId);
  }

  @Post('remove-item/:cartId')
  async removeItem(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(ItemIdOnlySchema)) body: { itemId: string },
  ) {
    return this.cartV2Service.removeItemFromCart(cartId, body.itemId);
  }

  @Post('clear-cart/:cartId')
  async clearCart(@Param('cartId') cartId: string) {
    return this.cartV2Service.clearCart(cartId);
  }

  @Post('update-order-note/:cartId')
  async updateOrderNote(
    @Param('cartId') cartId: string,
    @Body() body: { note: string },
  ) {
    return this.cartV2Service.updateOrderNote(cartId, body.note);
  }

  @UseGuards(JwtAuthGuard)
  @Post('merge-carts')
  async mergeCarts(
    @Body() body: { cartId: string },
    @CurrentUser() user: User,
  ) {
    return this.cartV2Service.mergeUserCart(user.id, body.cartId);
  }
}
