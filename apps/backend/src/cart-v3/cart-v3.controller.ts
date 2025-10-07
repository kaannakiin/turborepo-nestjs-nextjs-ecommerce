import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { type User } from '@repo/database';
import {
  AddCartReqBodyV3Schema,
  DecraseOrIncreaseCartItemReqBodyV3Schema,
  type NonAuthUserAddressZodType,
  type AddCartReqBodyV3Type,
  type DecraseOrIncreaseCartItemReqBodyV3Type,
  NonAuthUserAddressSchema,
} from '@repo/types';
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

  @HttpCode(HttpStatus.OK)
  @Post('decrease-item')
  @UseGuards(OptionalJwtAuthGuard)
  async decreaseItemQuantity(
    @Body(new ZodValidationPipe(DecraseOrIncreaseCartItemReqBodyV3Schema))
    data: DecraseOrIncreaseCartItemReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.decreaseItemQuantity({
      cartId: data.cartId,
      data,
      userId: user ? user.id : null,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('increase-item')
  @UseGuards(OptionalJwtAuthGuard)
  async increaseItemQuantity(
    @Body(new ZodValidationPipe(DecraseOrIncreaseCartItemReqBodyV3Schema))
    data: DecraseOrIncreaseCartItemReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.increaseItemQuantity({
      cartId: data.cartId,
      data,
      userId: user ? user.id : null,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('clear-cart/:cartId')
  @UseGuards(OptionalJwtAuthGuard)
  async clearCart(
    @Param('cartId') cartId: string,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.clearCart(cartId, user ? user.id : null);
  }

  @HttpCode(HttpStatus.OK)
  @Post('remove-item')
  @UseGuards(OptionalJwtAuthGuard)
  async removeItem(
    @Body(new ZodValidationPipe(DecraseOrIncreaseCartItemReqBodyV3Schema))
    data: DecraseOrIncreaseCartItemReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.removeItem(user ? user.id : null, data);
  }

  @Get('get-user-cart-info-for-checkout/:cartId')
  async getUserCartInfoForCheckout(@Param('cartId') cartId: string) {
    return this.cartV3Service.getCartForClientCheckout(cartId);
  }

  @Post('update-cart-address')
  @UseGuards(OptionalJwtAuthGuard)
  async updateCartAddress(
    @Body() body: { cartId: string; addressId: string },
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.updateCartAddress(
      body.cartId,
      body.addressId,
      user ? user.id : null,
    );
  }

  @Post('set-non-auth-user-address-to-cart/:cartId')
  async setNonAuthUserAddressToCart(
    @Param('cartId') cartId: string,
    @Body(new ZodValidationPipe(NonAuthUserAddressSchema))
    data: NonAuthUserAddressZodType,
  ) {
    return this.cartV3Service.setNonAuthUserAddressToCart(cartId, data);
  }
}
