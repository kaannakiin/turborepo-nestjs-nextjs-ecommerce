"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { TURKEY_DB_ID } from "@lib/constants";
import { notifications } from "@mantine/notifications";
import { createId, useQuery } from "@repo/shared";
import { CheckoutPageCartType } from "@repo/types";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { CheckoutStep } from "../../page";
import AddressCard from "../AddressCard";
import ShippingStep from "../ShippingStep";
import NonAuthUserAddressForm from "./NonAuthUserAdressForm";

interface NonAuthUserCheckoutPageProps {
  step: CheckoutStep;
  cartId: string;
}
const NonAuthUserCheckoutPage = ({
  step,
  cartId,
}: NonAuthUserCheckoutPageProps) => {
  const { replace, refresh } = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isPending, isFetching } = useQuery({
    queryKey: ["get-cart-by-id", cartId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/get-cart-by-id/${cartId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch addresses");
      }
      const data = (await res.json()) as { cart: CheckoutPageCartType | null };
      return data;
    },
  });

  if (isLoading || isPending || isFetching) {
    return <GlobalLoadingOverlay />;
  }

  if (!data || !data.cart) {
    return notFound();
  }
  const { shippingAddress, billingAddress } = data.cart;
  return (
    <div>
      {step === "info" ? (
        <NonAuthUserAddressForm
          defaultValues={
            data.cart?.shippingAddress
              ? {
                  addressLine1: shippingAddress.addressLine1,
                  addressLine2: shippingAddress.addressLine2 || "",
                  cityId: shippingAddress.cityId || "",
                  countryId: shippingAddress.countryId || "",
                  email: shippingAddress.email || "",
                  addressType: shippingAddress.addressLocationType,
                  campaignCheckbox: true,
                  id: shippingAddress.id,
                  name: shippingAddress.name,
                  phone: shippingAddress.phone || "",
                  surname: shippingAddress.surname,
                  postalCode: null,
                }
              : {
                  addressType: "CITY",
                  email: "",
                  name: "",
                  phone: "",
                  surname: "",
                  cityId: null,
                  stateId: null,
                  countryId: TURKEY_DB_ID,
                  id: createId(),
                  addressLine1: "",
                  addressLine2: null,
                  postalCode: null,
                  campaignCheckbox: true,
                }
          }
          onSubmit={async (data) => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/set-unauth-shipping-address-to-cart/${cartId}`,
              {
                method: "POST",
                body: JSON.stringify(data), // { data } yerine sadece data
                credentials: "include",
                headers: {
                  "Content-Type": "application/json", // Bu satırı ekleyin
                },
              }
            );
            if (!res.ok) {
              notifications.show({
                message: "Adres kaydedilirken bir hata oluştu",
                color: "red",
                title: "Hata",
                position: "bottom-right",
              });
              return;
            }

            const params = new URLSearchParams(searchParams.toString());
            params.set("step", "shipping" as CheckoutStep);
            replace(`?${params.toString()}`, { scroll: false });
          }}
        />
      ) : (
        step === "shipping" && (
          <>
            <AddressCard
              data={shippingAddress}
              onEdit={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("step", "info" as CheckoutStep);
                replace(`?${params.toString()}`);
              }}
            />
            <ShippingStep />
          </>
        )
      )}
    </div>
  );
};

export default NonAuthUserCheckoutPage;
