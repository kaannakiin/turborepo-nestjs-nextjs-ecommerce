import { Prisma } from "@repo/database";
import { CartV3 } from "../products/cart-schemas-v3";

export type CheckoutAddressType = Prisma.AddressSchemaGetPayload<{
  include: {
    city: {
      select: {
        id: true;
        name: true;
      };
    };
    country: {
      select: {
        id: true;
        name: true;
        translations: true;
        emoji: true;
      };
    };
    state: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;
export type CheckoutCargoRule = Prisma.CargoRuleGetPayload<{
  select: {
    id: true;
    currency: true;
    name: true;
    price: true;
    ruleType: true;
  };
}>;

export type GetCartClientCheckoutReturnType = {
  success: boolean;
  message?: string;
  cart?: CartV3 & {
    billingAddress: CheckoutAddressType | null;
    shippingAddress: CheckoutAddressType | null;
    cargoRule: CheckoutCargoRule | null;
  };
};
