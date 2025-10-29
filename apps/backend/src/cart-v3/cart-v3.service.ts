import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@repo/database';
import {
  AddCartReqBodyV3Type,
  addressInclude,
  CartActionResponseV3,
  CartForPayment,
  CartItemForPayment,
  CartItemV3,
  CartItemWithRelations,
  CartV3,
  DecraseOrIncreaseCartItemReqBodyV3Type,
  GetCartClientCheckoutReturnType,
  GetCartForPaymentIncludeCartType,
  GetCartForPaymentReturnType,
  NonAuthUserAddressZodType,
  TURKEY_DB_ID,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShippingService } from 'src/shipping/shipping.service';

@Injectable()
export class CartV3Service {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
  ) {}

  private mapCartItemToV3(item: CartItemWithRelations): CartItemV3 {
    const isVariant = !!item.variant && !!item.variantId;

    // Variant veya product'tan doğru veriyi al
    const source = isVariant ? item.variant! : item.product;
    const priceObj = source.prices.find((p) => p.currency === 'TRY');
    const translation = (
      isVariant ? item.variant!.product : item.product
    ).translations.find((t) => t.locale === 'TR');

    if (!priceObj || !translation) {
      throw new Error('Fiyat veya çeviri bilgisi bulunamadı');
    }

    const baseProduct = isVariant ? item.variant!.product : item.product;

    return {
      productId: item.productId!,
      ...(isVariant && { variantId: item.variantId! }),
      price: priceObj.price,
      productName: translation.name,
      productSlug: translation.slug,
      quantity: item.quantity,
      whereAdded: item.whereAdded,
      discountedPrice: priceObj.discountedPrice || undefined,
      productAsset: isVariant
        ? item.variant!.assets[0]?.asset || baseProduct.assets[0]?.asset
        : item.product.assets[0]?.asset,
      categories: baseProduct.categories.map((c) => ({
        categoryId: c.category.id,
        categorySlug: c.category.translations.find((t) => t.locale === 'TR')!
          .slug,
        name: c.category.translations.find((t) => t.locale === 'TR')!.name,
        categoryAsset: c.category.image,
      })),
      productBrand: baseProduct.brand?.translations.find(
        (t) => t.locale === 'TR',
      )
        ? {
            brandId: baseProduct.brand.id,
            brandSlug: baseProduct.brand.translations.find(
              (t) => t.locale === 'TR',
            )!.slug,
            name: baseProduct.brand.translations.find((t) => t.locale === 'TR')!
              .name,
            brandAsset: baseProduct.brand.image,
          }
        : undefined,
      ...(isVariant && {
        variantOptions: item
          .variant!.options?.filter(
            (vo) =>
              vo.productVariantOption.variantOption.translations.find(
                (tr) => tr.locale === 'TR',
              ) &&
              vo.productVariantOption.variantOption.variantGroup.translations.find(
                (tr) => tr.locale === 'TR',
              ),
          )
          .map((vo) => ({
            variantGroupName:
              vo.productVariantOption.variantOption.variantGroup.translations.find(
                (tr) => tr.locale === 'TR',
              )!.name,
            variantGroupSlug:
              vo.productVariantOption.variantOption.variantGroup.translations.find(
                (tr) => tr.locale === 'TR',
              )!.slug,
            variantOptionName:
              vo.productVariantOption.variantOption.translations.find(
                (tr) => tr.locale === 'TR',
              )!.name,
            variantOptionSlug:
              vo.productVariantOption.variantOption.translations.find(
                (tr) => tr.locale === 'TR',
              )!.slug,
            variantOptionHexValue:
              vo.productVariantOption.variantOption.hexValue || undefined,
            variantOptionAsset:
              vo.productVariantOption.variantOption.asset || undefined,
          })),
      }),
    };
  }

  private async prepareVariantItem(
    data: AddCartReqBodyV3Type,
  ): Promise<{ success: boolean; message?: string; item?: CartItemV3 }> {
    const variant = await this.prisma.productVariantCombination.findUnique({
      where: {
        id: data.variantId!,
        productId: data.productId,
      },
      include: {
        assets: {
          orderBy: { order: 'asc' },
          take: 1,
          where: { asset: { type: 'IMAGE' } },
          select: { asset: { select: { url: true, type: true } } },
        },
        options: {
          orderBy: [
            { productVariantOption: { productVariantGroup: { order: 'asc' } } },
            { productVariantOption: { order: 'asc' } },
          ],
          include: {
            productVariantOption: {
              include: {
                variantOption: {
                  select: {
                    id: true,
                    asset: { select: { url: true, type: true } },
                    hexValue: true,
                    translations: true,
                    variantGroup: {
                      select: { id: true, translations: true, type: true },
                    },
                  },
                },
              },
            },
          },
        },
        prices: true,
        translations: true,
        product: {
          include: {
            categories: {
              orderBy: { createdAt: 'asc' },
              select: {
                category: {
                  select: {
                    id: true,
                    translations: true,
                    image: { select: { url: true, type: true } },
                  },
                },
              },
            },
            translations: true,
            brand: {
              select: {
                id: true,
                translations: true,
                image: { select: { url: true, type: true } },
              },
            },
            assets: {
              orderBy: { order: 'asc' },
              take: 1,
              where: { asset: { type: 'IMAGE' } },
              select: { asset: { select: { url: true, type: true } } },
            },
          },
        },
      },
    });

    if (!variant) {
      return { success: false, message: 'Ürün varyantı bulunamadı' };
    }

    const priceObj = variant.prices.find((p) => p.currency === 'TRY');
    if (!priceObj) {
      return { success: false, message: 'Fiyat bilgisi bulunamadı' };
    }

    const translation = variant.product.translations.find(
      (t) => t.locale === 'TR',
    );
    if (!translation) {
      return { success: false, message: 'Çeviri bilgisi bulunamadı' };
    }
    const addedCart: CartItemV3 = {
      price: priceObj.price,
      productId: data.productId,
      productName: translation.name,
      productSlug: translation.slug,
      quantity: 1,
      whereAdded: data.whereAdded,
      categories:
        variant.product.categories
          .filter((c) => c.category.translations.find((t) => t.locale === 'TR'))
          ?.map((c) => ({
            categoryId: c.category.id,
            categorySlug: c.category.translations.find(
              (t) => t.locale === 'TR',
            )!.slug,
            name: c.category.translations.find((t) => t.locale === 'TR')!.name,
            categoryAsset: c.category.image,
          })) || [],
      discountedPrice: priceObj.discountedPrice || undefined,
      productAsset:
        variant.assets[0]?.asset ||
        variant.product.assets[0]?.asset ||
        undefined,
      productBrand:
        variant.product.brand &&
        variant.product.brand.translations.find((t) => t.locale === 'TR')
          ? {
              brandId: variant.product.brand.id,
              brandSlug: variant.product.brand.translations.find(
                (t) => t.locale === 'TR',
              )!.slug,
              name: variant.product.brand.translations.find(
                (t) => t.locale === 'TR',
              )!.name,
              brandAsset: variant.product.brand.image,
            }
          : undefined,
      variantId: variant.id,
      variantOptions:
        variant.options
          ?.filter(
            (vo) =>
              vo.productVariantOption.variantOption.translations.find(
                (tr) => tr.locale === 'TR',
              ) &&
              vo.productVariantOption.variantOption.variantGroup.translations.find(
                (tr) => tr.locale === 'TR',
              ),
          )
          .map((vo) => {
            return {
              variantGroupName:
                vo.productVariantOption.variantOption.variantGroup.translations.find(
                  (tr) => tr.locale === 'TR',
                )!.name,
              variantGroupSlug:
                vo.productVariantOption.variantOption.variantGroup.translations.find(
                  (tr) => tr.locale === 'TR',
                )!.slug,
              variantOptionName:
                vo.productVariantOption.variantOption.translations.find(
                  (tr) => tr.locale === 'TR',
                )!.name,
              variantOptionSlug:
                vo.productVariantOption.variantOption.translations.find(
                  (tr) => tr.locale === 'TR',
                )!.slug,
              variantOptionHexValue:
                vo.productVariantOption.variantOption.hexValue || undefined,
              variantOptionAsset:
                vo.productVariantOption.variantOption.asset || undefined,
            };
          }) || [],
    };
    return { success: true, item: addedCart, message: 'Başarılı' };
  }

  private async prepareProductItem(
    data: AddCartReqBodyV3Type,
  ): Promise<{ success: boolean; message?: string; item?: CartItemV3 }> {
    const product = await this.prisma.product.findUnique({
      where: {
        id: data.productId,
      },
      include: {
        categories: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            category: {
              select: {
                id: true,

                translations: true,
                image: { select: { url: true, type: true } },
              },
            },
          },
        },
        translations: true,
        prices: true,
        brand: {
          select: {
            id: true,
            translations: true,
            image: { select: { url: true, type: true } },
          },
        },
        assets: {
          orderBy: {
            order: 'asc',
          },
          take: 1,
          where: {
            asset: {
              type: 'IMAGE',
            },
          },
          select: {
            asset: {
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return {
        success: false,
        message: 'Ürün bulunamadı',
      };
    }

    const priceObj = product.prices.find((p) => p.currency === 'TRY');

    if (!priceObj) {
      return {
        success: false,
        message: 'Ürün için fiyat bilgisi bulunamadı',
      };
    }

    const translation = product.translations.find((t) => t.locale === 'TR');

    if (!translation) {
      return {
        success: false,
        message: 'Ürün için çeviri bilgisi bulunamadı',
      };
    }
    const addedCart = {
      productId: product.id,
      price: priceObj.price,
      productName: translation.name,
      productSlug: translation.slug,
      quantity: 1,
      whereAdded: data.whereAdded,
      categories:
        product.categories
          .filter((c) => c.category.translations.find((t) => t.locale === 'TR'))
          ?.map((c) => ({
            categoryId: c.category.id,
            categorySlug: c.category.translations.find(
              (t) => t.locale === 'TR',
            )!.slug,
            name: c.category.translations.find((t) => t.locale === 'TR')!.name,
            categoryAsset: c.category.image,
          })) || [],
      productBrand:
        product.brand &&
        product.brand.translations.find((t) => t.locale === 'TR')
          ? {
              brandId: product.brand.id,
              brandSlug: product.brand.translations.find(
                (t) => t.locale === 'TR',
              )!.slug,
              name: product.brand.translations.find((t) => t.locale === 'TR')!
                .name,
              brandAsset: product.brand.image,
            }
          : undefined,
      discountedPrice: priceObj.discountedPrice || undefined,
      productAsset: product.assets[0]?.asset || undefined,
    };
    return { success: true, item: addedCart, message: 'Başarılı' };
  }

  private async prepareCartItem(data: AddCartReqBodyV3Type) {
    if (data.variantId) {
      return await this.prepareVariantItem(data);
    }
    return await this.prepareProductItem(data);
  }

  private async findOrCreateCart(
    cartId: string | null | undefined,
    user: User | null,
  ): Promise<Prisma.CartGetPayload<{ include: { items: true } }>> {
    // 1. cartId varsa cart'ı bul
    if (cartId) {
      const cart = await this.prisma.cart.findUnique({
        where: {
          id: cartId,
          ...(user && { userId: user.id }),
        },
        include: { items: true },
      });

      if (cart) return cart;
    }

    if (user) {
      const userCart = await this.prisma.cart.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
        include: { items: true },
      });

      if (userCart) return userCart;
    }

    // 3. Yoksa yeni cart oluştur
    return await this.prisma.cart.create({
      data: {
        ...(user && { userId: user.id }),
        currency: 'TRY',
        locale: 'TR',
        status: 'ACTIVE',
      },
      include: { items: true },
    });
  }

  async getCartForClientCheckout(
    cartId: string,
  ): Promise<GetCartClientCheckoutReturnType> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
        status: 'ACTIVE',
      },
      include: {
        items: {
          where: {
            isVisible: true,
            deletedAt: null,
            visibleCause: null,
            quantity: { gt: 0 },
          },
          include: {
            product: {
              include: {
                categories: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                  select: {
                    category: {
                      select: {
                        id: true,

                        translations: true,
                        image: { select: { url: true, type: true } },
                      },
                    },
                  },
                },
                translations: true,
                prices: true,
                brand: {
                  select: {
                    id: true,
                    translations: true,
                    image: { select: { url: true, type: true } },
                  },
                },
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  where: {
                    asset: {
                      type: 'IMAGE',
                    },
                  },
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
            variant: {
              include: {
                assets: {
                  orderBy: { order: 'asc' },
                  take: 1,
                  where: { asset: { type: 'IMAGE' } },
                  select: { asset: { select: { url: true, type: true } } },
                },
                options: {
                  orderBy: [
                    {
                      productVariantOption: {
                        productVariantGroup: { order: 'asc' },
                      },
                    },
                    { productVariantOption: { order: 'asc' } },
                  ],
                  include: {
                    productVariantOption: {
                      include: {
                        variantOption: {
                          select: {
                            id: true,
                            asset: { select: { url: true, type: true } },
                            hexValue: true,
                            translations: true,
                            variantGroup: {
                              select: {
                                id: true,
                                translations: true,
                                type: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
                product: {
                  include: {
                    categories: {
                      orderBy: { createdAt: 'asc' },
                      select: {
                        category: {
                          select: {
                            id: true,
                            translations: true,
                            image: { select: { url: true, type: true } },
                          },
                        },
                      },
                    },
                    translations: true,
                    brand: {
                      select: {
                        id: true,
                        translations: true,
                        image: { select: { url: true, type: true } },
                      },
                    },
                    assets: {
                      orderBy: { order: 'asc' },
                      take: 1,
                      where: { asset: { type: 'IMAGE' } },
                      select: { asset: { select: { url: true, type: true } } },
                    },
                  },
                },
              },
            },
          },
        },
        billingAddress: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            district: {
              select: {
                name: true,
                id: true,
              },
            },
            country: {
              select: {
                id: true,
                name: true,
                translations: true,
                emoji: true,
              },
            },
            state: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shippingAddress: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            country: {
              select: {
                id: true,
                name: true,
                translations: true,
                emoji: true,
              },
            },
            district: {
              select: {
                id: true,
                name: true,
              },
            },
            state: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        cargoRule: {
          select: {
            id: true,
            currency: true,
            name: true,
            price: true,
            ruleType: true,
          },
        },
        user: {
          select: {
            phone: true,
            email: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    if (!cart) {
      return {
        success: false,
      };
    }

    const items: CartItemV3[] = cart.items.map((item) =>
      this.mapCartItemToV3(item),
    );

    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const totalDiscount = items.reduce((acc, item) => {
      if (item.discountedPrice) {
        return acc + (item.price - item.discountedPrice) * item.quantity;
      }
      return acc;
    }, 0);

    const cartForClientCheckout: GetCartClientCheckoutReturnType['cart'] = {
      cartId: cart.id,
      createdAt: cart.createdAt,
      currency: cart.currency as CartV3['currency'],
      lastActivityAt: cart.updatedAt,
      locale: cart.locale as CartV3['locale'],
      items,
      totalDiscount,
      totalPrice,
      totalItems: items.length,
      updatedAt: cart.updatedAt,
      orderNote: undefined,
      userId: cart.userId || undefined,
      billingAddress: cart.billingAddress || null,
      shippingAddress: cart.shippingAddress || null,
      cargoRule: cart.cargoRule || null,
      user: cart.user || null,
    };
    return { success: true, cart: cartForClientCheckout };
  }

  async getCartForClient(
    userId: string | undefined,
    cartId: string,
  ): Promise<{ success: boolean; cart?: CartV3 }> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
        ...(userId && { userId }),
        status: 'ACTIVE',
      },
      include: {
        items: {
          where: {
            isVisible: true,
            deletedAt: null,
            visibleCause: null,
            quantity: { gt: 0 },
          },
          include: {
            product: {
              include: {
                categories: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                  select: {
                    category: {
                      select: {
                        id: true,

                        translations: true,
                        image: { select: { url: true, type: true } },
                      },
                    },
                  },
                },
                translations: true,
                prices: true,
                brand: {
                  select: {
                    id: true,
                    translations: true,
                    image: { select: { url: true, type: true } },
                  },
                },
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  where: {
                    asset: {
                      type: 'IMAGE',
                    },
                  },
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
              },
            },
            variant: {
              include: {
                assets: {
                  orderBy: { order: 'asc' },
                  take: 1,
                  where: { asset: { type: 'IMAGE' } },
                  select: { asset: { select: { url: true, type: true } } },
                },
                options: {
                  orderBy: [
                    {
                      productVariantOption: {
                        productVariantGroup: { order: 'asc' },
                      },
                    },
                    { productVariantOption: { order: 'asc' } },
                  ],
                  include: {
                    productVariantOption: {
                      include: {
                        variantOption: {
                          select: {
                            id: true,
                            asset: { select: { url: true, type: true } },
                            hexValue: true,
                            translations: true,
                            variantGroup: {
                              select: {
                                id: true,
                                translations: true,
                                type: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
                product: {
                  include: {
                    categories: {
                      orderBy: { createdAt: 'asc' },
                      select: {
                        category: {
                          select: {
                            id: true,
                            translations: true,
                            image: { select: { url: true, type: true } },
                          },
                        },
                      },
                    },
                    translations: true,
                    brand: {
                      select: {
                        id: true,
                        translations: true,
                        image: { select: { url: true, type: true } },
                      },
                    },
                    assets: {
                      orderBy: { order: 'asc' },
                      take: 1,
                      where: { asset: { type: 'IMAGE' } },
                      select: { asset: { select: { url: true, type: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        success: false,
      };
    }

    const items: CartItemV3[] = cart.items.map((item) =>
      this.mapCartItemToV3(item),
    );

    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const totalDiscount = items.reduce((acc, item) => {
      if (item.discountedPrice) {
        return acc + (item.price - item.discountedPrice) * item.quantity;
      }
      return acc;
    }, 0);

    const cartForClient: CartV3 = {
      cartId: cart.id,
      createdAt: cart.createdAt,
      currency: cart.currency as CartV3['currency'],
      lastActivityAt: cart.updatedAt,
      locale: cart.locale as CartV3['locale'],
      items,
      totalDiscount,
      totalPrice,
      totalItems: items.length,
      updatedAt: cart.updatedAt,
      orderNote: undefined,
      userId: cart.userId || undefined,
    };
    return { success: true, cart: cartForClient };
  }

  async addItemToCart(
    data: AddCartReqBodyV3Type,
    user: User | null,
  ): Promise<CartActionResponseV3> {
    const addedCart = await this.prepareCartItem(data);

    if (!addedCart.success || !addedCart.item) {
      return {
        success: false,
        message: 'Sepete eklenecek ürün bilgisi oluşturulamadı',
      };
    }

    let cart = await this.findOrCreateCart(data.cartId, user);

    if (!cart) {
      return {
        success: false,
        message: 'Sepet oluşturulamadı',
      };
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId === addedCart.item!.productId &&
        item.variantId === addedCart.item!.variantId,
    );

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: { increment: 1 },
          whereAdded: data.whereAdded, // Son nereden eklendiğini güncelle
          updatedAt: new Date(),
          isVisible: true,
          deletedAt: null,
          visibleCause: null,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addedCart.item!.productId,
          variantId: addedCart.item!.variantId,
          quantity: 1,
          whereAdded: data.whereAdded,
        },
      });
    }
    const clientCart = await this.getCartForClient(cart?.userId, cart.id);
    if (!clientCart.success || !clientCart.cart) {
      return {
        success: false,
        message: 'Güncellenmiş sepet bilgisi getirilemedi',
      };
    }
    return { success: true, newCart: clientCart.cart, message: 'Başarılı' };
  }

  async decreaseItemQuantity({
    cartId,
    userId,
    data,
  }: {
    cartId: string;
    userId: string | null;
    data: DecraseOrIncreaseCartItemReqBodyV3Type;
  }): Promise<CartActionResponseV3> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        items: true,
      },
    });

    if (!cart || (userId && cart.userId !== userId)) {
      return {
        success: false,
        message: 'Sepet bulunamadı.',
      };
    }
    const item = cart.items.find(
      (i) => i.productId === data.productId && i.variantId === data.variantId,
    );

    if (!item) {
      return {
        success: false,
        message: 'Sepet ürünü bulunamadı.',
      };
    }

    if (item.quantity <= 1) {
      await this.prisma.cartItem.update({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId || null,
          },
        },
        data: {
          isVisible: false,
          deletedAt: new Date(),
          visibleCause: 'DELETED_BY_USER',
          quantity: 0,
        },
      });
    } else {
      await this.prisma.cartItem.update({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId: data.productId,
            variantId: data.variantId || null,
          },
        },
        data: {
          quantity: { decrement: 1 },
        },
      });
    }
    const clientCart = await this.getCartForClient(cart?.userId, cart.id);
    if (!clientCart.success || !clientCart.cart) {
      return {
        success: false,
        message: 'Güncellenmiş sepet bilgisi getirilemedi',
      };
    }
    return { success: true, newCart: clientCart.cart, message: 'Başarılı' };
  }

  async increaseItemQuantity({
    cartId,
    userId,
    data,
  }: {
    cartId: string;
    userId: string | null;
    data: DecraseOrIncreaseCartItemReqBodyV3Type;
  }): Promise<CartActionResponseV3> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        items: {
          where: {
            isVisible: true,
            deletedAt: null,
            visibleCause: null,
            quantity: { gt: 0 },
          },
        },
      },
    });

    if (!cart || (userId && cart.userId !== userId)) {
      return {
        success: false,
        message: 'Sepet bulunamadı.',
      };
    }

    const item = cart.items.find(
      (i) => i.productId === data.productId && i.variantId === data.variantId,
    );

    if (!item) {
      return {
        success: false,
        message: 'Sepet ürünü bulunamadı.',
      };
    }

    await this.prisma.cartItem.update({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null,
        },
      },
      data: {
        quantity: { increment: 1 },
      },
    });

    const clientCart = await this.getCartForClient(cart?.userId, cart.id);
    if (!clientCart.success || !clientCart.cart) {
      return {
        success: false,
        message: 'Güncellenmiş sepet bilgisi getirilemedi',
      };
    }
    return { success: true, newCart: clientCart.cart, message: 'Başarılı' };
  }

  async clearCart(
    cartId: string,
    userId: string | null,
  ): Promise<CartActionResponseV3> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
        ...(userId && { userId }),
      },
    });

    if (!cart || (userId && cart.userId !== userId)) {
      return {
        success: false,
        message: 'Sepet bulunamadı',
      };
    }

    await this.prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
      },
      data: {
        isVisible: false,
        deletedAt: new Date(),
        visibleCause: 'DELETED_BY_USER',
        quantity: 0,
      },
    });

    const clientCart = await this.getCartForClient(cart?.userId, cart.id);

    if (!clientCart.success || !clientCart.cart) {
      return {
        success: false,
        message: 'Güncellenmiş sepet bilgisi getirilemedi',
      };
    }
    return { success: true, newCart: clientCart.cart, message: 'Başarılı' };
  }

  async removeItem(
    userId: string | null,
    data: DecraseOrIncreaseCartItemReqBodyV3Type,
  ): Promise<CartActionResponseV3> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: data.cartId,
        ...(userId && { userId }),
      },
    });

    if (!cart || (userId && cart.userId !== userId)) {
      return {
        success: false,
        message: 'Sepet bulunamadı',
      };
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null,
        },
      },
    });

    if (!item) {
      return {
        success: false,
        message: 'Sepet ürünü bulunamadı',
      };
    }

    await this.prisma.cartItem.update({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null,
        },
      },
      data: {
        quantity: 0,
        isVisible: false,
        deletedAt: new Date(),
        visibleCause: 'DELETED_BY_USER',
      },
    });
    const clientCart = await this.getCartForClient(cart?.userId, cart.id);
    if (!clientCart.success || !clientCart.cart) {
      return {
        success: false,
        message: 'Güncellenmiş sepet bilgisi getirilemedi',
      };
    }
    return { success: true, newCart: clientCart.cart, message: 'Başarılı' };
  }

  async updateCartAddress(
    cartId: string,
    addressId: string,
    userId: string | null,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // 1. Sepeti kontrol et
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
        ...(userId && { userId }),
      },
    });

    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı' };
    }

    // 2. Adresi kontrol et
    const address = await this.prisma.addressSchema.findUnique({
      where: {
        id: addressId,
      },
    });

    if (!address) {
      return { success: false, message: 'Adres bulunamadı' };
    }

    // 3. Eğer kullanıcı giriş yapmışsa, adresin ona ait olup olmadığını kontrol et
    if (userId && address.userId !== userId) {
      return {
        success: false,
        message: 'Bu adres size ait değil',
      };
    }

    // 4. Eğer adres başka bir kullanıcıya aitse (ve mevcut kullanıcı null ise) hata ver
    if (!userId && address.userId) {
      return {
        success: false,
        message: 'Bu adres kullanılamaz',
      };
    }

    // 5. Transaction ile sepeti ve kullanıcının default adresini güncelle
    await this.prisma.$transaction(async (prisma) => {
      // Sepete adresi ata
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          shippingAddressId: address.id,
        },
      });

      // Eğer kullanıcı varsa, default adresini güncelle
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            defaultAddressId: address.id,
          },
        });
      }
    });

    return {
      success: true,
      message: 'Adres başarıyla güncellendi',
    };
  }

  async setNonAuthUserAddressToCart(
    cartId: string,
    data: NonAuthUserAddressZodType,
  ): Promise<{
    succses: boolean;
    message: string;
  }> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        const cart = await prisma.cart.findUnique({
          where: { id: cartId },
        });

        if (!cart) {
          throw new Error('Sepet bulunamadı.');
        }

        const addressData = {
          name: data.name,
          surname: data.surname,
          phone: data.phone,
          email: data.email,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          zipCode: data.postalCode,
          addressLocationType: data.addressType,
          tcKimlikNo: data.tcKimlikNo || null,
          ...(data.addressType === 'CITY' &&
          data.countryId === TURKEY_DB_ID &&
          data.districtId
            ? {
                cityId: data.cityId,
                stateId: null,
                districtId: data.districtId,
              }
            : data.addressType === 'CITY'
              ? {
                  cityId: data.cityId,
                  stateId: null,
                  districtId: null,
                }
              : data.addressType === 'STATE'
                ? {
                    stateId: data.stateId,
                    cityId: null,
                    districtId: null,
                  }
                : {}),
          countryId: data.countryId,
        };

        if (cart.shippingAddressId) {
          // Mevcut adresi güncelle
          await prisma.addressSchema.update({
            where: { id: cart.shippingAddressId },
            data: addressData,
          });
        } else {
          // Yeni adres oluştur ve sepete bağla
          const newAddress = await prisma.addressSchema.create({
            data: addressData,
          });

          await prisma.cart.update({
            where: { id: cartId },
            data: { shippingAddressId: newAddress.id },
          });
        }
      });

      return {
        succses: true,
        message: 'Adres başarıyla kaydedildi.',
      };
    } catch (error) {
      return {
        succses: false,
        message: error.message || 'Bir hata oluştu.',
      };
    }
  }

  async setCartCargoRule(
    cartId: string,
    cargoRuleId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const availableMethos =
      await this.shippingService.getAvailableShippingMethods(cartId);

    if (!availableMethos.success) {
      return {
        success: false,
        message: 'Gönderim yöntemleri alınamadı',
      };
    }
    const isCargoRuleValid = availableMethos.shippingMethods.rules.find(
      (method) => method.id === cargoRuleId,
    );
    if (!isCargoRuleValid) {
      return {
        success: false,
        message: 'Geçersiz kargo kuralı',
      };
    }
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { cargoRuleId },
    });
    return {
      success: true,
      message: 'Kargo kuralı başarıyla güncellendi',
    };
  }

  async getCartForPayment(
    cartId: string,
  ): Promise<GetCartForPaymentReturnType> {
    try {
      const cart = (await this.prisma.cart.findUnique({
        where: { id: cartId },
        include: GetCartForPaymentIncludeCartType,
      })) as CartForPayment;

      if (!cart) {
        return { success: false, message: 'Sepet bulunamadı' };
      }

      if (!cart.items || cart.items.length === 0) {
        return {
          success: false,
          message: 'Sepette ödeme için uygun ürün bulunamadı',
        };
      }

      if (!cart.shippingAddress || !cart.shippingAddressId) {
        return {
          success: false,
          message: 'Lütfen gönderim adresi ekleyin',
        };
      }

      if (!cart.cargoRuleId || !cart.cargoRule) {
        return {
          success: false,
          message: 'Lütfen gönderim yöntemi seçin',
        };
      }

      const cartTotal = this.shippingService.calculateCartTotal(
        cart.items.map((item: CartItemForPayment) => ({
          product: item.product,
          variant: item.variant || undefined,
          quantity: item.quantity,
        })),
        'TRY',
      );

      const matchingZone = await this.shippingService.findMatchingCargoZone(
        cart.shippingAddress.countryId,
        cart.shippingAddress.addressLocationType === 'STATE'
          ? cart.shippingAddress.stateId
          : null,
        cart.shippingAddress.addressLocationType === 'CITY'
          ? cart.shippingAddress.cityId
          : null,
        cart.currency,
        cartTotal,
      );

      if (!matchingZone) {
        return {
          success: false,
          message: 'Bu adres için kargo hizmeti bulunmuyor.',
        };
      }

      if (matchingZone.rules.length === 0) {
        return {
          success: false,
          message: 'Bu sepet tutarı için uygun kargo seçeneği bulunmuyor.',
        };
      }

      const isSelectedRuleStillValid = matchingZone.rules.some(
        (rule) => rule.id === cart.cargoRuleId,
      );

      if (!isSelectedRuleStillValid) {
        return {
          success: false,
          message:
            'Seçilen kargo yöntemi, adres veya sepet tutarındaki değişiklik nedeniyle artık geçerli değil. Lütfen kargo seçeneklerini güncelleyin.',
        };
      }

      return {
        success: true,
        message: 'Sepet başarıyla alındı',
        data: {
          cart,
          totalAmount: cartTotal,
        },
      };
    } catch (error) {
      console.error('Error fetching cart for payment:', error);
      return { success: false, message: 'Sepet alınırken bir hata oluştu' };
    }
  }
}
