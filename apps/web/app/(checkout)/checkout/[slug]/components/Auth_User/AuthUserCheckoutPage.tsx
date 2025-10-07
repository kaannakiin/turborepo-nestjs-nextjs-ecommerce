"use client";
import { GetCartClientCheckoutReturnType, TokenPayload } from "@repo/types";
import { CheckoutStep } from "../../page";
import PaymentStep from "../PaymentStep";
import AuthUserAddressList from "./AuthUserAddressList";
import AuthUserShippingList from "./AuthUserShippingList";

interface AuthUserCheckoutPageProps {
  cartId: string;
  userInfo: TokenPayload;
  step: CheckoutStep;
  data: GetCartClientCheckoutReturnType["cart"] | null;
}

const AuthUserCheckoutPage = ({
  cartId,
  step,
  userInfo,
  data,
}: AuthUserCheckoutPageProps) => {
  return (
    <>
      {step === "info" ? (
        <AuthUserAddressList cartId={cartId} userInfo={userInfo} />
      ) : step === "shipping" &&
        data &&
        data.shippingAddress?.id &&
        data.shippingAddress ? (
        <AuthUserShippingList
          cart={{
            cart: data,
          }}
        />
      ) : data &&
        data.shippingAddress?.id &&
        data.shippingAddress &&
        data.cargoRule &&
        data.cargoRule?.id ? (
        <PaymentStep cart={data} />
      ) : null}
    </>
  );
};

export default AuthUserCheckoutPage;
