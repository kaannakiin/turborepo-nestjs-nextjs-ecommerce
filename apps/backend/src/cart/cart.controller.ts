import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Currency, Locale, type User } from '@repo/database';
import { type Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { ActiveContext } from 'src/common/decorators/active-context.decorator';
import { CartId } from 'src/common/decorators/cart-id.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  AddCartItemDto,
  ClearCartDto,
  DecreaseCartItemQuantityDto,
  IncreaseCartItemQuantityDto,
  RemoveCartItemDto,
  UpdateCartContextDto,
} from './cart-dto';
import { CartService } from './cart.service';

@ApiTags('Sepet')
@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
@ApiSecurity('token')
@ApiSecurity('csrf_header')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Mevcut sepeti getir' })
  @ApiResponse({ status: 200, description: 'Mevcut sepeti döner.' })
  async getCart(
    @CurrentUser() user: User | null,
    @CartId() cookieCartId: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @ActiveContext('locale') locale: Locale,
    @ActiveContext('currency') currency: Currency,
  ) {
    return await this.cartService.getCart(
      user,
      cookieCartId,
      res,
      locale,
      currency,
    );
  }

  @Post('add')
  @UseGuards(ZodValidationPipe)
  @ApiOperation({
    summary: 'Sepete ürün ekle',
    description:
      'Sepete ekler. Dönen sepet kullanıcının dil ve para birimine göredir.',
  })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, description: 'Ürün eklendi.' })
  async addItem(
    @Body() data: AddCartItemDto,
    @CurrentUser() user: User | null,
    @CartId() cookieCartId: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @ActiveContext('locale') locale: Locale,
    @ActiveContext('currency') currency: Currency,
  ) {
    return await this.cartService.addItem(
      user,
      cookieCartId,
      data,
      res,
      locale,
      currency,
    );
  }

  @Post('remove')
  @UseGuards(ZodValidationPipe)
  @ApiOperation({ summary: 'Sepetten ürün çıkar' })
  @ApiBody({ type: RemoveCartItemDto })
  @ApiResponse({ status: 200, description: 'Ürün çıkarıldı.' })
  async removeItem(
    @Body() data: RemoveCartItemDto,
    @CurrentUser() user: User | null,
    @CartId() cookieCartId: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @ActiveContext('locale') locale: Locale,
    @ActiveContext('currency') currency: Currency,
  ) {
    return await this.cartService.removeItem(
      user,
      cookieCartId,
      data,
      res,
      locale,
      currency,
    );
  }

  @Post('increase')
  @UseGuards(ZodValidationPipe)
  @ApiOperation({ summary: 'Adet artır' })
  @ApiBody({ type: IncreaseCartItemQuantityDto })
  @ApiResponse({ status: 200, description: 'Adet artırıldı.' })
  async increaseQuantity(
    @Body() data: IncreaseCartItemQuantityDto,
    @CurrentUser() user: User | null,
    @CartId() cookieCartId: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @ActiveContext('locale') locale: Locale,
    @ActiveContext('currency') currency: Currency,
  ) {
    return await this.cartService.increaseQuantity(
      user,
      cookieCartId,
      data,
      res,
      locale,
      currency,
    );
  }

  @Post('decrease')
  @UseGuards(ZodValidationPipe)
  @ApiOperation({ summary: 'Adet azalt' })
  @ApiBody({ type: DecreaseCartItemQuantityDto })
  @ApiResponse({ status: 200, description: 'Adet azaltıldı.' })
  async decreaseQuantity(
    @Body() data: DecreaseCartItemQuantityDto,
    @CurrentUser() user: User | null,
    @CartId() cookieCartId: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @ActiveContext('locale') locale: Locale,
    @ActiveContext('currency') currency: Currency,
  ) {
    return await this.cartService.decreaseQuantity(
      user,
      cookieCartId,
      data,
      res,
      locale,
      currency,
    );
  }

  @Post('clear')
  @UseGuards(ZodValidationPipe)
  @ApiOperation({ summary: 'Sepeti temizle' })
  @ApiBody({ type: ClearCartDto })
  @ApiResponse({ status: 200, description: 'Sepet temizlendi.' })
  async clearCart(
    @Body() data: ClearCartDto,
    @CurrentUser() user: User | null,
    @CartId() cookieCartId: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @ActiveContext('locale') locale: Locale,
    @ActiveContext('currency') currency: Currency,
  ) {
    return await this.cartService.clearCart(
      user,
      cookieCartId,
      res,
      locale,
      currency,
    );
  }

  @Post('update-context')
  @UseGuards(ZodValidationPipe)
  @ApiOperation({
    summary: 'Sepet context güncelle',
    description:
      'Locale veya currency değiştiğinde sepeti validate eder. Geçersiz ürünler gizlenir, eski context için gizlenmiş ürünler restore edilir.',
  })
  @ApiBody({ type: UpdateCartContextDto })
  @ApiResponse({
    status: 200,
    description: 'Context güncellendi, invalidItems ve restoredItems döner.',
  })
  async updateCartContext(
    @Body() data: UpdateCartContextDto,
    @CurrentUser() user: User | null,
    @CartId() cookieCartId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.cartService.updateCartContext(
      user,
      cookieCartId,
      data.locale,
      data.currency,
      res,
    );
  }
}
