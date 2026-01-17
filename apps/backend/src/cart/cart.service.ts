import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Cart,
  CartItem,
  CartStatus,
  Currency,
  inVisibleCause,
  Locale,
  User,
} from '@repo/database';
import { recalculateCartTotals } from '@repo/shared';
import {
  CART_COOKIE_NAME,
  cartItemArgs,
  CartContextUpdateResponse,
  CartItemWithVariant,
  CartType,
} from '@repo/types';
import { type Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddCartItemDto,
  DecreaseCartItemQuantityDto,
  IncreaseCartItemQuantityDto,
  RemoveCartItemDto,
} from './cart-dto';
import { CartItemValidationService } from './cart-item-validation.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cartItemValidationService: CartItemValidationService,
  ) {}

  private handleCartCookie(
    res: Response,
    existingCartId: string | undefined,
    newCartId: string,
  ) {
    if (existingCartId !== newCartId) {
      res.cookie(CART_COOKIE_NAME, newCartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
  }

  async resolveCart(user: User | null, cookieCartId?: string): Promise<Cart> {
    if (user) {
      const userCart = await this.prismaService.cart.findFirst({
        where: { userId: user.id, status: CartStatus.ACTIVE },
        include: { items: true },
      });

      if (cookieCartId) {
        if (userCart && cookieCartId !== userCart.id) {
          const guestCart = await this.prismaService.cart.findUnique({
            where: { id: cookieCartId, status: CartStatus.ACTIVE },
            include: { items: true },
          });

          const hasActiveItems = guestCart?.items.some(
            (i) => i.isVisible && !i.deletedAt,
          );

          if (guestCart && !guestCart.userId && hasActiveItems) {
            await this.mergeCarts(userCart.id, guestCart);
          }
        }

        if (!userCart) {
          const guestCart = await this.prismaService.cart.findUnique({
            where: { id: cookieCartId, status: CartStatus.ACTIVE },
          });

          if (guestCart && !guestCart.userId) {
            return this.prismaService.cart.update({
              where: { id: cookieCartId },
              data: { userId: user.id },
            });
          }
        }
      }

      if (userCart) return userCart;

      return this.prismaService.cart.create({
        data: { userId: user.id, status: CartStatus.ACTIVE },
      });
    }

    if (cookieCartId) {
      const guestCart = await this.prismaService.cart.findUnique({
        where: { id: cookieCartId, status: CartStatus.ACTIVE },
      });

      if (guestCart && !guestCart.userId) {
        return guestCart;
      }
    }

    return this.prismaService.cart.create({
      data: { status: CartStatus.ACTIVE },
    });
  }

  async mergeGuestCartToUser(user: User, guestCartId: string): Promise<Cart> {
    const guestCart = await this.prismaService.cart.findUnique({
      where: { id: guestCartId, status: CartStatus.ACTIVE },
      include: { items: true },
    });

    if (!guestCart || guestCart.userId === user.id) {
      return this.getOrCreateUserCart(user.id);
    }

    if (guestCart.userId && guestCart.userId !== user.id) {
      return this.getOrCreateUserCart(user.id);
    }

    const userCart = await this.prismaService.cart.findFirst({
      where: { userId: user.id, status: CartStatus.ACTIVE },
      include: { items: true },
    });

    if (!userCart) {
      return this.prismaService.cart.update({
        where: { id: guestCartId },
        data: { userId: user.id },
      });
    }

    await this.mergeCarts(userCart.id, guestCart);

    return this.prismaService.cart.findUniqueOrThrow({
      where: { id: userCart.id },
    });
  }

  private async mergeCarts(
    targetCartId: string,
    sourceCart: Cart & { items: CartItem[] },
  ) {
    await this.prismaService.$transaction(async (tx) => {
      const activeSourceItems = sourceCart.items.filter(
        (i) => i.isVisible && i.deletedAt === null,
      );

      for (const sourceItem of activeSourceItems) {
        const targetItem = await tx.cartItem.findFirst({
          where: { cartId: targetCartId, variantId: sourceItem.variantId },
        });

        if (targetItem) {
          let newQuantity = sourceItem.quantity;

          if (targetItem.isVisible && targetItem.deletedAt === null) {
            newQuantity += targetItem.quantity;
          } else {
            newQuantity = sourceItem.quantity;
          }

          await tx.cartItem.update({
            where: { id: targetItem.id },
            data: {
              quantity: newQuantity,
              isVisible: true,
              deletedAt: null,
              visibleCause: null,
              updatedAt: new Date(),
            },
          });

          await tx.cartItem.update({
            where: { id: sourceItem.id },
            data: {
              isVisible: false,
              deletedAt: new Date(),
            },
          });
        } else {
          await tx.cartItem.update({
            where: { id: sourceItem.id },
            data: { cartId: targetCartId },
          });
        }
      }

      await tx.cart.update({
        where: { id: sourceCart.id },
        data: {
          status: 'MERGED',
        },
      });
    });
  }
  async getCart(
    user: User | null,
    cookieCartId: string | undefined,
    res: Response,
    locale: Locale,
    currency: Currency,
  ): Promise<CartType> {
    const cart = await this.resolveCart(user, cookieCartId);
    this.handleCartCookie(res, cookieCartId, cart.id);
    return this.getFormattedCart(cart.id, locale, currency);
  }

  async addItem(
    user: User | null,
    cookieCartId: string | undefined,
    data: AddCartItemDto,
    res: Response,
    locale: Locale,
    currency: Currency,
  ): Promise<CartType> {
    const cart = await this.resolveCart(user, cookieCartId);

    const existingItem = await this.prismaService.cartItem.findFirst({
      where: { cartId: cart.id, variantId: data.itemId },
    });

    if (existingItem) {
      await this.prismaService.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
          isVisible: true,
          deletedAt: null,
          visibleCause: null,
          whereAdded: data.whereAdded,
        },
      });
    } else {
      await this.prismaService.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: data.itemId,
          quantity: data.quantity,
          whereAdded: data.whereAdded,
        },
      });
    }

    await this.prismaService.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    this.handleCartCookie(res, cookieCartId, cart.id);

    return this.getFormattedCart(cart.id, locale, currency);
  }

  async removeItem(
    user: User | null,
    cookieCartId: string | undefined,
    data: RemoveCartItemDto,
    res: Response,
    locale: Locale,
    currency: Currency,
  ): Promise<CartType> {
    const cart = await this.resolveCart(user, cookieCartId);

    await this.prismaService.cartItem.updateMany({
      where: {
        cartId: cart.id,
        variantId: data.itemId,
        isVisible: true,
      },
      data: {
        isVisible: false,
        deletedAt: new Date(),
        visibleCause: inVisibleCause.DELETED_BY_USER,
      },
    });

    this.handleCartCookie(res, cookieCartId, cart.id);

    return this.getFormattedCart(cart.id, locale, currency);
  }

  async increaseQuantity(
    user: User | null,
    cookieCartId: string | undefined,
    data: IncreaseCartItemQuantityDto,
    res: Response,
    locale: Locale,
    currency: Currency,
  ): Promise<CartType> {
    const cart = await this.resolveCart(user, cookieCartId);

    const item = await this.prismaService.cartItem.findFirst({
      where: { cartId: cart.id, variantId: data.itemId, isVisible: true },
    });

    if (!item) throw new NotFoundException('Ürün sepette bulunamadı');

    await this.prismaService.cartItem.update({
      where: { id: item.id },
      data: { quantity: item.quantity + data.quantity },
    });

    this.handleCartCookie(res, cookieCartId, cart.id);

    return this.getFormattedCart(cart.id, locale, currency);
  }

  async decreaseQuantity(
    user: User | null,
    cookieCartId: string | undefined,
    data: DecreaseCartItemQuantityDto,
    res: Response,
    locale: Locale,
    currency: Currency,
  ): Promise<CartType> {
    const cart = await this.resolveCart(user, cookieCartId);

    const item = await this.prismaService.cartItem.findFirst({
      where: { cartId: cart.id, variantId: data.itemId, isVisible: true },
    });

    if (!item) throw new NotFoundException('Ürün sepette bulunamadı');

    const newQuantity = item.quantity - data.quantity;

    if (newQuantity <= 0) {
      await this.prismaService.cartItem.update({
        where: { id: item.id },
        data: {
          isVisible: false,
          deletedAt: new Date(),
          visibleCause: inVisibleCause.DELETED_BY_USER,
          quantity: 0,
        },
      });
    } else {
      await this.prismaService.cartItem.update({
        where: { id: item.id },
        data: { quantity: newQuantity },
      });
    }

    this.handleCartCookie(res, cookieCartId, cart.id);

    return this.getFormattedCart(cart.id, locale, currency);
  }

  async clearCart(
    user: User | null,
    cookieCartId: string | undefined,
    res: Response,
    locale: Locale,
    currency: Currency,
  ): Promise<CartType> {
    const cart = await this.resolveCart(user, cookieCartId);

    await this.prismaService.cartItem.updateMany({
      where: { cartId: cart.id, isVisible: true },
      data: {
        isVisible: false,
        deletedAt: new Date(),
        visibleCause: inVisibleCause.DELETED_BY_USER,
      },
    });

    this.handleCartCookie(res, cookieCartId, cart.id);

    return this.getFormattedCart(cart.id, locale, currency);
  }

  private async getOrCreateUserCart(userId: string): Promise<Cart> {
    let cart = await this.prismaService.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
    });

    if (!cart) {
      cart = await this.prismaService.cart.create({
        data: { userId, status: CartStatus.ACTIVE },
      });
    }
    return cart;
  }

  private async getFormattedCart(
    cartId: string,
    locale: Locale,
    currency: Currency,
  ): Promise<CartType> {
    const cart = await this.prismaService.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: { items: cartItemArgs(currency, locale) },
    });

    const items = cart.items as CartItemWithVariant[];

    const baseCart: CartType = {
      cartId: cart.id,
      userId: cart.userId,
      totalItems: 0,
      totalAmount: 0,
      totalDiscount: 0,
      currency,
      locale,
      totalProducts: 0,
      items: [],
    };

    return recalculateCartTotals(baseCart, items);
  }

  async updateCartContext(
    user: User | null,
    cookieCartId: string | undefined,
    newLocale: Locale,
    newCurrency: Currency,
    res: Response,
  ): Promise<CartContextUpdateResponse> {
    const cart = await this.resolveCart(user, cookieCartId);

    const contextChanged =
      cart.locale !== newLocale || cart.currency !== newCurrency;

    if (!contextChanged) {
      const formattedCart = await this.getFormattedCart(
        cart.id,
        newLocale,
        newCurrency,
      );

      return {
        cart: formattedCart,
        invalidItems: [],
        restoredItems: [],
        contextChanged: false,
      };
    }

    const restoreResult =
      await this.cartItemValidationService.restoreEligibleItems(
        cart.id,
        newLocale,
        newCurrency,
      );

    const validationResult =
      await this.cartItemValidationService.validateCartItems(
        cart.id,
        newLocale,
        newCurrency,
      );

    await this.cartItemValidationService.hideInvalidItems(
      validationResult.itemsToHide,
    );

    await this.prismaService.cart.update({
      where: { id: cart.id },
      data: {
        locale: newLocale,
        currency: newCurrency,
        updatedAt: new Date(),
      },
    });

    this.handleCartCookie(res, cookieCartId, cart.id);

    const invalidItemsDetails =
      await this.cartItemValidationService.getInvalidItemsDetails(
        validationResult.itemsToHide.map((item) => item.id),
      );

    const formattedCart = await this.getFormattedCart(
      cart.id,
      newLocale,
      newCurrency,
    );

    return {
      cart: formattedCart,
      invalidItems: invalidItemsDetails,
      restoredItems: restoreResult.restoredItemIds,
      contextChanged: true,
    };
  }
}
