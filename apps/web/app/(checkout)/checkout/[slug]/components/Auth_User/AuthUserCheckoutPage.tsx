"use client";
import { GetUserCartInfoForCheckoutReturn, TokenPayload } from "@repo/types";
import { CheckoutStep } from "../../page";
import PaymentStep from "../PaymentStep";
import AuthUserAddressList from "./AuthUserAddressList";
import AuthUserShippingList from "./AuthUserShippingList";

interface AuthUserCheckoutPageProps {
  cartId: string;
  userInfo: TokenPayload;
  step: CheckoutStep;
  data: GetUserCartInfoForCheckoutReturn;
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
        data.shippingAddressId &&
        data.shippingAddress ? (
        <AuthUserShippingList cart={data} />
      ) : data &&
        data.shippingAddressId &&
        data.shippingAddress &&
        data.cargoRule &&
        data.cargoRuleId ? (
        <PaymentStep cart={data} />
      ) : null}
    </>
  );
};

export default AuthUserCheckoutPage;
