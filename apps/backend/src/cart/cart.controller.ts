import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  $Enums,
  AddCartItemToCartBody,
  NonAuthUserAddressSchema,
  type NonAuthUserAddressZodType,
  type AddCartItemToCartBodyType,
} from '@repo/types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add-item-to-cart')
  @UsePipes(new ZodValidationPipe(AddCartItemToCartBody))
  async addCartItemToCart(@Body() data: AddCartItemToCartBodyType) {
    return this.cartService.addCartItemToCart(data);
  }

  @Post('increment-item-or-delete-item')
  @UsePipes(
    new ZodValidationPipe(
      AddCartItemToCartBody.pick({
        cartId: true,
        productId: true,
        variantId: true,
        quantity: true,
      }),
    ),
  )
  async incrementCartItemOrDeleteItem(
    @Body()
    data: Pick<
      AddCartItemToCartBodyType,
      'cartId' | 'productId' | 'variantId' | 'quantity'
    >,
  ) {
    return this.cartService.incrementOrDeleteCartItemToCart(data);
  }

  @Get('user-get-cart/:cartId')
  async getCart(@Param('cartId') cartId: string) {
    return this.cartService.getCart(cartId);
  }

  @Post('switch-cart-locale/:cartId/:locale')
  async switchCartLocale(
    @Body() data: { cartId: string; locale: $Enums.Locale },
  ) {
    return this.cartService.switchLocale(data.cartId, data.locale);
  }

  @Post('switch-cart-currency/:cartId/:currency')
  async switchCartCurrency(
    @Body() data: { cartId: string; currency: $Enums.Currency },
  ) {
    return this.cartService.switchCurrency(data.cartId, data.currency);
  }

  @Post('clear-cart/:cartId')
  async clearCart(@Body() data: { cartId: string }) {
    return this.cartService.clearCart(data.cartId);
  }

  @Get('get-cart-by-id/:cartId')
  async getCartById(@Param('cartId') cartId: string) {
    return this.cartService.getCartById(cartId);
  }

  @Post('set-unauth-shipping-address-to-cart/:cartId')
  // @UsePipes(new ZodValidationPipe(NonAuthUserAddressSchema))
  async setUnAuthShippingAddressToCart(
    @Param('cartId') cartId: string,
    @Body() data: NonAuthUserAddressZodType,
  ) {
    return this.cartService.setUnAuthShippingAddressToCart(cartId, data);
  }
}
