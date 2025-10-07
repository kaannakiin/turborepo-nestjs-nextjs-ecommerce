"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { TURKEY_DB_ID } from "@lib/constants";
import { createId } from "@repo/shared";
import {
  GetCartClientCheckoutReturnType,
  GetUserCartInfoForCheckoutReturn,
} from "@repo/types";
import dynamic from "next/dynamic";
import { CheckoutStep } from "../../page";
import PaymentStep from "../PaymentStep";

const NonAuthUserAddressForm = dynamic(
  () => import("./NonAuthUserAddressForm"),
  {
    ssr: false,
    loading: () => <GlobalLoadingOverlay />,
  }
);
const AuthUserShippingList = dynamic(
  () => import("../Auth_User/AuthUserShippingList"),
  {
    ssr: false,
    loading: () => <GlobalLoadingOverlay />,
  }
);

interface NonAuthUserCheckoutPageProps {
  cartId: string;
  step: CheckoutStep;
  data: GetCartClientCheckoutReturnType["cart"];
}

const NonAuthUserCheckoutPage = ({
  cartId,
  step,
  data,
}: NonAuthUserCheckoutPageProps) => {
  return (
    <>
      {step === "info" ? (
        <NonAuthUserAddressForm
          cartId={cartId}
          defaultValues={
            data.shippingAddress
              ? {
                  addressLine1: data.shippingAddress.addressLine1,
                  addressLine2: data.shippingAddress.addressLine2 || null,
                  addressType:
                    data.shippingAddress.addressLocationType || "CITY",
                  campaignCheckbox: true,
                  countryId: data.shippingAddress.countryId || TURKEY_DB_ID,
                  email: data.shippingAddress.email || "",
                  id: data.shippingAddress.id || createId(),
                  name: data.shippingAddress.name || "",
                  phone: data.shippingAddress.phone || "",
                  postalCode: data.shippingAddress.zipCode || null,
                  surname: data.shippingAddress.surname || "",
                  cityId: data.shippingAddress.cityId || null,
                  stateId: data.shippingAddress.stateId || null,
                }
              : null
          }
        />
      ) : step === "shipping" ? (
        <AuthUserShippingList
          cart={{
            cart: data,
          }}
        />
      ) : (
        <PaymentStep
          cart={{
            billingAddress: data.billingAddress,
            cargoRule: data.cargoRule,
            cartId: data.cartId,
            currency: data.currency,
            shippingAddress: data.shippingAddress,
          }}
        />
      )}
    </>
  );
};

export default NonAuthUserCheckoutPage;
