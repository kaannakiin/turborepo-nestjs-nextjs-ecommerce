"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { Stack } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { TokenPayload, UserDbAddressType } from "@repo/types";
import { CheckoutStep } from "../../page";
import AuthUserAddressList from "./AuthUserAddressList";
import { notifications } from "@mantine/notifications";

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
  const { data, isLoading, isPending, refetch } = useQuery({
    queryKey: ["users-address", userInfo.id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/locations/get-user-addresses`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res?.ok) throw new Error("Failed to fetch user's addresses");
      const data = (await res.json()) as Array<
        UserDbAddressType & { isDefault: boolean }
      >;
      return data;
    },
    enabled: !!userInfo.id && step === "info",
  });

  return (
    <Stack gap="lg" mt={"lg"}>
      {(isLoading || isPending) && <GlobalLoadingOverlay />}
      {step === "info" ? (
        <>
          <AuthUserAddressList
            addresses={data}
            cartId={cartId}
            userInfo={userInfo}
            refetch={refetch}
          />
        </>
      ) : null}
    </Stack>
  );
};

export default AuthUserCheckoutPage;
