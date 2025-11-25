import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { type User } from '@repo/database/client';
import {
  AddCartReqBodyV3Schema,
  type AddCartReqBodyV3Type,
  DecraseOrIncreaseCartItemReqBodyV3Schema,
  type DecraseOrIncreaseCartItemReqBodyV3Type,
  NonAuthUserAddressSchema,
  type NonAuthUserAddressZodType,
} from '@repo/types';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CartV3Service } from './cart-v3.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartV3Controller {
  constructor(private readonly cartV3Service: CartV3Service) {}

  @HttpCode(HttpStatus.OK)
  @Post('add-item')
  @UseGuards(OptionalJwtAuthGuard)
  async addItemToCart(
    @Body(new ZodValidationPipe(AddCartReqBodyV3Schema))
    data: AddCartReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.addItemToCart(data, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':cartId')
  @UseGuards(OptionalJwtAuthGuard)
  async getCartById(
    @Param('cartId') cartId: string,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.getCartForMainClient(cartId, user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('decrease-item')
  @UseGuards(OptionalJwtAuthGuard)
  async decreaseItemQuantity(
    @Body(new ZodValidationPipe(DecraseOrIncreaseCartItemReqBodyV3Schema))
    data: DecraseOrIncreaseCartItemReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.decreaseCartItemQuantity(data, user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('increase-item')
  @UseGuards(OptionalJwtAuthGuard)
  async increaseItemQuantity(
    @Body(new ZodValidationPipe(DecraseOrIncreaseCartItemReqBodyV3Schema))
    data: DecraseOrIncreaseCartItemReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.increaseCartItemQuantity(data, user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('clear-cart/:cartId')
  async clearCart(@Param('cartId') cartId: string) {
    return this.cartV3Service.clearCart(cartId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('remove-item')
  @UseGuards(OptionalJwtAuthGuard)
  async removeItem(
    @Body(new ZodValidationPipe(DecraseOrIncreaseCartItemReqBodyV3Schema))
    data: DecraseOrIncreaseCartItemReqBodyV3Type,
    @CurrentUser() user: User | null,
  ) {
    return this.cartV3Service.removeItemFromCart(data, user);
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

  @Put('set-cart-cargo-rule')
  async setCartCargoRule(
    @Body() body: { cartId: string; cargoRuleId: string },
  ) {
    return this.cartV3Service.setCartCargoRule(body.cartId, body.cargoRuleId);
  }

  @Get('merge-carts/:cartId')
  @UseGuards(JwtAuthGuard)
  async mergeCarts(
    @Param('cartId') mergedCartId: string,
    @CurrentUser() user: User,
  ) {
    return this.cartV3Service.mergeCarts(mergedCartId, user);
  }
}
