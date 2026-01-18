import { Currency, Prisma } from "@repo/database/client";
export const AdminCargoZoneQuery = {
  locations: {
    include: {
      country: {
        include: {
          translations: true,
        },
      },
    },
  },
  rules: true,
} as const satisfies Prisma.CargoZoneInclude;

export type CargoZones = Prisma.CargoZoneGetPayload<{
  include: typeof AdminCargoZoneQuery;
}>;

export type CartItemWithPrices = Prisma.CartItemGetPayload<{
  select: {
    quantity: true;
    variant: { select: { prices: true } };
    product: { select: { prices: true } };
  };
}>;

export type LocationWithCargoZone = Prisma.LocationGetPayload<{
  include: {
    country: {
      select: {
        type: true;
      };
    };
    cargoZone: {
      select: {
        rules: {
          where: {
            currency: Currency;
          };
        };
      };
    };
  };
}>;

export type CargoRuleWithDetails = Prisma.CargoRuleGetPayload<{
  select: {
    id: true;
    name: true;
    price: true;
    currency: true;
    ruleType: true;
    minValue: true;
    maxValue: true;
  };
}>;

export type ShippingMethodsResponse = {
  success: boolean;
  message?: string;
  shippingMethods?: {
    rules: CargoRuleWithDetails[];
  };
};
