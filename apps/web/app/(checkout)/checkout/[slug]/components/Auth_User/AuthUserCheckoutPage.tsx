"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { useQuery } from "@repo/shared";
import { GetUserCartInfoForCheckoutReturn, TokenPayload } from "@repo/types";
import { CheckoutStep } from "../../page";
import PaymentStep from "../PaymentStep";
import AuthUserAddressList from "./AuthUserAddressList";
import AuthUserShippingList from "./AuthUserShippingList";

interface AuthUserCheckoutPageProps {
  cartId: string;
  userInfo: TokenPayload;
  step: CheckoutStep;
}

const AuthUserCheckoutPage = ({
  cartId,
  step,
  userInfo,
}: AuthUserCheckoutPageProps) => {
  const { data, isLoading, isPending, isFetching } = useQuery({
    queryKey: ["auth-user-cartd", userInfo.id, cartId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart-v2/get-user-cart-info-for-checkout?cartId=${cartId}&userId=${userInfo.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        return null;
      }
      const data = (await res.json()) as GetUserCartInfoForCheckoutReturn;
      return data;
    },
    enabled: !!cartId && !!userInfo.id,
  });
  if (isLoading || isPending || isFetching) {
    return <GlobalLoadingOverlay />;
  }
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
