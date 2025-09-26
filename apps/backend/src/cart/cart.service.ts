import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { $Enums, Prisma } from '@repo/database';
import {
  AddCartItemToCartBodyType,
  CartItemType,
  CartType,
  CheckoutPageCartType,
  NonAuthUserAddressZodType,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private returnCartType(
    dbCart: Prisma.CartGetPayload<{
      include: {
        items: {
          orderBy: {
            createdAt: 'desc';
          };
          include: {
            product: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc';
                  };
                  take: 1;
                  select: {
                    asset: {
                      select: {
                        url: true;
                        type: true;
                      };
                    };
                  };
                };
                prices: true;
                translations: true;
              };
            };
            variant: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc';
                  };
                  take: 1;
                  select: {
                    asset: {
                      select: {
                        url: true;
                        type: true;
                      };
                    };
                  };
                };
                prices: true;
                translations: true;
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc';
                      };
                    };
                  };
                  include: {
                    productVariantOption: {
                      select: {
                        productVariantGroup: {
                          select: {
                            variantGroup: {
                              select: {
                                id: true;
                                translations: true;
                                type: true;
                              };
                            };
                          };
                        };
                        variantOption: {
                          select: {
                            id: true;
                            asset: {
                              select: {
                                url: true;
                                type: true;
                              };
                            };
                            hexValue: true;
                            translations: true;
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    }>,
    targetLocale: $Enums.Locale = 'TR',
    targetCurrency: $Enums.Currency = 'TRY',
  ): CartType {
    const totalPrice: number = dbCart.items.reduce((acc, item) => {
      const prices = item.variant?.prices || item.product?.prices || [];
      const price = prices.find((p) => p.currency === targetCurrency);
      return acc + (price?.price || 0) * item.quantity;
    }, 0);

    const totalDiscountPrice: number = dbCart.items.reduce((acc, item) => {
      const prices = item.variant?.prices || item.product?.prices || [];
      const price = prices.find((p) => p.currency === targetCurrency);
      return acc + (price?.discountedPrice || 0) * item.quantity;
    }, 0);

    const totalDiscountedPrice: number = dbCart.items.reduce((acc, item) => {
      const prices = item.variant?.prices || item.product?.prices || [];
      const price = prices.find((p) => p.currency === targetCurrency);
      return (
        acc + (price?.discountedPrice || price?.price || 0) * item.quantity
      );
    }, 0);

    const totalItems = dbCart.items.reduce(
      (acc, item) => acc + item.quantity,
      0,
    );

    return {
      cartId: dbCart.id,
      userId: dbCart.userId,
      currency: targetCurrency,
      locale: targetLocale,
      totalDiscountedPrice: totalDiscountedPrice,
      totalPrice: totalPrice,
      totalItems: totalItems,
      totalDiscount: totalPrice - totalDiscountPrice, // Gerçek discount miktarı
      createdAt: dbCart.createdAt,
      items: dbCart.items.map((item) => {
        // Price bilgilerini al
        const prices = item.variant?.prices || item.product?.prices || [];
        const priceInfo = prices.find((p) => p.currency === targetCurrency);

        // Product translation (TR locale için)
        const productTranslation =
          item.product?.translations?.find((t) => t.locale === targetLocale) ||
          item.product?.translations?.[0];

        // Product asset
        const productAsset = item.product?.assets?.[0]?.asset || null;

        // Variant asset
        const variantAsset = item.variant?.assets?.[0]?.asset || null;

        // Variant options mapping
        const variantOptions =
          item.variant?.options?.map((option) => {
            const variantGroup =
              option.productVariantOption.productVariantGroup.variantGroup;
            const variantOption = option.productVariantOption.variantOption;

            const groupTranslation =
              variantGroup.translations?.find(
                (t) => t.locale === targetLocale,
              ) || variantGroup.translations?.[0];
            const optionTranslation =
              variantOption.translations?.find(
                (t) => t.locale === targetLocale,
              ) || variantOption.translations?.[0];

            return {
              variantGroupName: groupTranslation?.name || '',
              variantOptionName: optionTranslation?.name || '',
              variantGroupSlug: groupTranslation?.slug || '',
              variantOptionSlug: optionTranslation?.slug || '',
              variantOptionHexColor: variantOption.hexValue,
              variantOptionAsset: variantOption.asset
                ? {
                    url: variantOption.asset.url,
                    type: variantOption.asset.type,
                  }
                : null,
              variantOptionId:
                option.productVariantOption.variantOption.id || option.id, // ID mapping'e dikkat
              variantGroupId:
                option.productVariantOption.productVariantGroup.variantGroup
                  .id || '', // ID mapping'e dikkat
              variantGroupType: variantGroup.type,
            };
          }) || [];

        const cartItem: CartItemType = {
          productId: item.productId || '',
          variantId: item.variantId,
          quantity: item.quantity,
          price: priceInfo?.price || 0,
          discountedPrice: priceInfo?.discountedPrice || priceInfo?.price || 0,
          currency: targetCurrency,
          productName: productTranslation?.name || '',
          productSlug: productTranslation?.slug || '',
          productAsset: productAsset
            ? {
                url: productAsset.url,
                type: productAsset.type,
              }
            : null,
          variantAsset: variantAsset
            ? {
                url: variantAsset.url,
                type: variantAsset.type,
              }
            : null,
          variantOptions:
            variantOptions.length > 0 ? variantOptions : undefined,
        };

        return cartItem;
      }),
    };
  }

  async addCartItemToCart(data: AddCartItemToCartBodyType) {
    return await this.prisma.$transaction(async (tx) => {
      if (data.cartId) {
        const cartExists = await tx.cart.findUnique({
          where: { id: data.cartId },
          include: {
            items: {
              where: {
                OR: [
                  { productId: data.productId, variantId: data.variantId },
                  { productId: data.productId, variantId: null },
                ],
              },
            },
          },
        });

        if (!cartExists) {
          throw new NotFoundException('Sepet Bulunamadı');
        }

        const cartItemExists = cartExists.items.find((item) => {
          if (data.variantId) {
            return item.variantId === data.variantId;
          }
          return item.productId === data.productId && item.variantId === null;
        });

        if (!cartItemExists) {
          await tx.cartItem.create({
            data: {
              cartId: cartExists.id,
              productId: data.productId,
              variantId: data.variantId || null,
              quantity: data.quantity,
            },
          });
        } else {
          await tx.cartItem.update({
            where: {
              id: cartItemExists.id,
            },
            data: {
              quantity: cartItemExists.quantity + data.quantity,
            },
          });
        }

        const newCart = await tx.cart.findUnique({
          where: { id: data.cartId },
          include: {
            items: {
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                product: {
                  include: {
                    assets: {
                      orderBy: {
                        order: 'asc',
                      },
                      take: 1,
                      select: {
                        asset: {
                          select: {
                            url: true,
                            type: true,
                          },
                        },
                      },
                    },
                    prices: true,
                    translations: true,
                  },
                },
                variant: {
                  include: {
                    assets: {
                      orderBy: {
                        order: 'asc',
                      },
                      take: 1,
                      select: {
                        asset: {
                          select: {
                            url: true,
                            type: true,
                          },
                        },
                      },
                    },
                    prices: true,
                    translations: true,
                    options: {
                      orderBy: {
                        productVariantOption: {
                          productVariantGroup: {
                            order: 'asc',
                          },
                        },
                      },
                      include: {
                        productVariantOption: {
                          select: {
                            productVariantGroup: {
                              select: {
                                variantGroup: {
                                  select: {
                                    id: true,
                                    translations: true,
                                    type: true,
                                  },
                                },
                              },
                            },
                            variantOption: {
                              select: {
                                id: true,
                                asset: {
                                  select: {
                                    url: true,
                                    type: true,
                                  },
                                },
                                hexValue: true,
                                translations: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        const cart = this.returnCartType(newCart);
        return cart;
      } else {
        const cart = await tx.cart.create({
          data: {
            ...(data.userId && { userId: data.userId }),
            items: {
              create: {
                productId: data.productId,
                variantId: data.variantId || null,
                quantity: data.quantity,
              },
            },
          },
          include: {
            items: {
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                product: {
                  include: {
                    assets: {
                      orderBy: {
                        order: 'asc',
                      },
                      take: 1,
                      select: {
                        asset: {
                          select: {
                            url: true,
                            type: true,
                          },
                        },
                      },
                    },
                    prices: true,
                    translations: true,
                  },
                },
                variant: {
                  include: {
                    assets: {
                      orderBy: {
                        order: 'asc',
                      },
                      take: 1,
                      select: {
                        asset: {
                          select: {
                            url: true,
                            type: true,
                          },
                        },
                      },
                    },
                    prices: true,
                    translations: true,
                    options: {
                      orderBy: {
                        productVariantOption: {
                          productVariantGroup: {
                            order: 'asc',
                          },
                        },
                      },
                      include: {
                        productVariantOption: {
                          select: {
                            productVariantGroup: {
                              select: {
                                variantGroup: {
                                  select: {
                                    id: true,
                                    translations: true,
                                    type: true,
                                  },
                                },
                              },
                            },
                            variantOption: {
                              select: {
                                id: true,
                                asset: {
                                  select: {
                                    url: true,
                                    type: true,
                                  },
                                },
                                hexValue: true,
                                translations: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        return this.returnCartType(cart);
      }
    });
  }

  async incrementOrDeleteCartItemToCart(
    data: Pick<
      AddCartItemToCartBodyType,
      'cartId' | 'productId' | 'variantId' | 'quantity'
    >,
  ) {
    if (!data.cartId) {
      throw new NotFoundException('Sepet Kimliği Gereklidir');
    }

    return await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: data.cartId },
        include: {
          items: {
            where: {
              OR: [
                { productId: data.productId, variantId: data.variantId },
                { productId: data.productId, variantId: null },
              ],
            },
          },
        },
      });

      if (!cart) {
        throw new NotFoundException('Sepet Bulunamadı');
      }

      const cartItemExists = cart.items.find((item) => {
        if (data.variantId) {
          return item.variantId === data.variantId;
        }
        return item.productId === data.productId && item.variantId === null;
      });

      if (!cartItemExists) {
        throw new NotFoundException('Sepet Ürünü Bulunamadı');
      }

      const newQuantity = cartItemExists.quantity - Math.abs(data.quantity); // Azaltma işlemi

      if (newQuantity <= 0) {
        await tx.cartItem.delete({
          where: {
            id: cartItemExists.id,
          },
        });
      } else {
        await tx.cartItem.update({
          where: {
            id: cartItemExists.id,
          },
          data: {
            quantity: newQuantity,
          },
        });
      }

      const newCart = await tx.cart.findUnique({
        where: { id: data.cartId },
        include: {
          items: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              product: {
                include: {
                  assets: {
                    orderBy: {
                      order: 'asc',
                    },
                    take: 1,
                    select: {
                      asset: {
                        select: {
                          url: true,
                          type: true,
                        },
                      },
                    },
                  },
                  prices: true,
                  translations: true,
                },
              },
              variant: {
                include: {
                  assets: {
                    orderBy: {
                      order: 'asc',
                    },
                    take: 1,
                    select: {
                      asset: {
                        select: {
                          url: true,
                          type: true,
                        },
                      },
                    },
                  },
                  prices: true,
                  translations: true,
                  options: {
                    orderBy: {
                      productVariantOption: {
                        productVariantGroup: {
                          order: 'asc',
                        },
                      },
                    },
                    include: {
                      productVariantOption: {
                        select: {
                          productVariantGroup: {
                            select: {
                              variantGroup: {
                                select: {
                                  id: true,
                                  translations: true,
                                  type: true,
                                },
                              },
                            },
                          },
                          variantOption: {
                            select: {
                              id: true,
                              asset: {
                                select: {
                                  url: true,
                                  type: true,
                                },
                              },
                              hexValue: true,
                              translations: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      return this.returnCartType(newCart);
    });
  }

  async getCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            product: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
              },
            },
            variant: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc',
                      },
                    },
                  },
                  include: {
                    productVariantOption: {
                      select: {
                        productVariantGroup: {
                          select: {
                            variantGroup: {
                              select: {
                                id: true,
                                translations: true,
                                type: true,
                              },
                            },
                          },
                        },
                        variantOption: {
                          select: {
                            id: true,
                            asset: {
                              select: {
                                url: true,
                                type: true,
                              },
                            },
                            hexValue: true,
                            translations: true,
                          },
                        },
                      },
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
      throw new NotFoundException('Sepet Bulunamadı');
    }

    return this.returnCartType(cart);
  }

  async switchLocale(cartId: string, targetLocale: $Enums.Locale) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            product: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
              },
            },
            variant: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc',
                      },
                    },
                  },
                  include: {
                    productVariantOption: {
                      select: {
                        productVariantGroup: {
                          select: {
                            variantGroup: {
                              select: {
                                id: true,
                                translations: true,
                                type: true,
                              },
                            },
                          },
                        },
                        variantOption: {
                          select: {
                            id: true,
                            asset: {
                              select: {
                                url: true,
                                type: true,
                              },
                            },
                            hexValue: true,
                            translations: true,
                          },
                        },
                      },
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
      throw new NotFoundException('Sepet Bulunamadı');
    }
    if (cart.locale === targetLocale) {
      return this.returnCartType(cart, targetLocale, cart.currency);
    }
    const updatedCart = await this.prisma.cart.update({
      where: { id: cartId },
      data: { locale: targetLocale },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            product: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
              },
            },
            variant: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc',
                      },
                    },
                  },
                  include: {
                    productVariantOption: {
                      select: {
                        productVariantGroup: {
                          select: {
                            variantGroup: {
                              select: {
                                id: true,
                                translations: true,
                                type: true,
                              },
                            },
                          },
                        },
                        variantOption: {
                          select: {
                            id: true,
                            asset: {
                              select: {
                                url: true,
                                type: true,
                              },
                            },
                            hexValue: true,
                            translations: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return this.returnCartType(updatedCart, targetLocale, cart.currency);
  }

  async switchCurrency(cartId: string, targetCurrency: $Enums.Currency) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            product: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
              },
            },
            variant: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc',
                      },
                    },
                  },
                  include: {
                    productVariantOption: {
                      select: {
                        productVariantGroup: {
                          select: {
                            variantGroup: {
                              select: {
                                id: true,
                                translations: true,
                                type: true,
                              },
                            },
                          },
                        },
                        variantOption: {
                          select: {
                            id: true,
                            asset: {
                              select: {
                                url: true,
                                type: true,
                              },
                            },
                            hexValue: true,
                            translations: true,
                          },
                        },
                      },
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
      throw new NotFoundException('Sepet Bulunamadı');
    }

    if (cart.currency === targetCurrency) {
      return this.returnCartType(cart, cart.locale, targetCurrency);
    }
    const updatedCart = await this.prisma.cart.update({
      where: { id: cartId },
      data: { currency: targetCurrency },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            product: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
              },
            },
            variant: {
              include: {
                assets: {
                  orderBy: {
                    order: 'asc',
                  },
                  take: 1,
                  select: {
                    asset: {
                      select: {
                        url: true,
                        type: true,
                      },
                    },
                  },
                },
                prices: true,
                translations: true,
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc',
                      },
                    },
                  },
                  include: {
                    productVariantOption: {
                      select: {
                        productVariantGroup: {
                          select: {
                            variantGroup: {
                              select: {
                                id: true,
                                translations: true,
                                type: true,
                              },
                            },
                          },
                        },
                        variantOption: {
                          select: {
                            id: true,
                            asset: {
                              select: {
                                url: true,
                                type: true,
                              },
                            },
                            hexValue: true,
                            translations: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return this.returnCartType(updatedCart, cart.locale, targetCurrency);
  }

  async clearCart(cartId: string) {
    try {
      await this.prisma.cartItem.deleteMany({
        where: { cartId },
      });
      await this.prisma.cart.delete({
        where: { id: cartId },
      });
      return null;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Eğer silinecek kayıt bulunamazsa, sepet zaten temiz demektir.
        return null;
      }
      throw new InternalServerErrorException(
        'Sepet temizlenirken bir hata oluştu',
      );
    }
  }

  async getCartById(
    cartId: string,
  ): Promise<{ cart: CheckoutPageCartType | null }> {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                assets: {
                  take: 1,
                  orderBy: {
                    order: 'asc',
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
                prices: true,
                translations: true,
              },
            },
            variant: {
              include: {
                assets: {
                  take: 1,
                  orderBy: {
                    order: 'asc',
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
                translations: true,
                prices: true,
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc',
                      },
                    },
                  },
                  include: {
                    productVariantOption: {
                      select: {
                        variantOption: {
                          select: {
                            translations: true,
                            asset: {
                              select: {
                                url: true,
                                type: true,
                              },
                            },
                            hexValue: true,
                          },
                        },
                        productVariantGroup: {
                          select: {
                            variantGroup: {
                              select: {
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
              },
            },
          },
        },
        billingAddress: {
          include: {
            city: { select: { id: true, name: true } },
            country: { select: { id: true, translations: true } },
            state: { select: { id: true, name: true } },
          },
        },
        shippingAddress: {
          include: {
            city: { select: { id: true, name: true } },
            country: { select: { id: true, translations: true } },
            state: { select: { id: true, name: true } },
          },
        },
        user: true,
      },
    });

    if (!cart) {
      return {
        cart: null,
      };
    }
    return {
      cart: cart,
    };
  }

  async setUnAuthShippingAddressToCart(
    cartId: string,
    addressData: NonAuthUserAddressZodType,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Sepet Bulunamadı');
    }

    const newAddress = await this.prisma.addressSchema.upsert({
      where: {
        id: addressData.id,
      },
      create: {
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        addressLocationType: addressData.addressType,
        countryId: addressData.countryId,
        ...(addressData.addressType === 'CITY'
          ? {
              cityId: addressData.cityId,
            }
          : addressData.addressType === 'STATE'
            ? {
                stateId: addressData.stateId,
              }
            : {
                cityId: null,
                stateId: null,
              }),
        zipCode: addressData.postalCode,
        name: addressData.name,
        phone: addressData.phone,
        surname: addressData.surname,
        email: addressData.email,
        shippingCarts: {
          connect: {
            id: cartId,
          },
        },
        billingCarts: {
          connect: {
            id: cartId,
          },
        },
      },
      update: {
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        addressLocationType: addressData.addressType,
        countryId: addressData.countryId,
        ...(addressData.addressType === 'CITY'
          ? {
              cityId: addressData.cityId,
              stateId: null,
            }
          : addressData.addressType === 'STATE'
            ? {
                stateId: addressData.stateId,
                cityId: null,
              }
            : {
                cityId: null,
                stateId: null,
              }),
        zipCode: addressData.postalCode,
        name: addressData.name,
        phone: addressData.phone,
        surname: addressData.surname,
        email: addressData.email,
        shippingCarts: {
          connect: {
            id: cartId,
          },
        },
        billingCarts: {
          connect: {
            id: cartId,
          },
        },
      },
    });
    return newAddress;
  }
}
