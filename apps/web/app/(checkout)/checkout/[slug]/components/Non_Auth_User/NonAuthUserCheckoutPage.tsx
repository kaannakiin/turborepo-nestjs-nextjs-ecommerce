"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { TURKEY_DB_ID } from "@lib/constants";
import { Divider, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createId, useQuery } from "@repo/shared";
import { CheckoutPageCartType } from "@repo/types";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { CheckoutStep } from "../../page";
import AddressCard from "../AddressCard";
import ShippingCard from "../ShippingCard";
import ShippingStep from "../ShippingStep";
import NonAuthUserAdressForm from "./NonAuthUserAdressForm";
import NonAuthUserPaymentForm from "./NonAuthUserPaymentForm";

interface NonAuthUserCheckoutPageProps {
  step: CheckoutStep;
  cartId: string;
}
const NonAuthUserCheckoutPage = ({
  step,
  cartId,
}: NonAuthUserCheckoutPageProps) => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isPending, isFetching, refetch } = useQuery({
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
    <Stack gap="lg" mt={"lg"}>
      {step === "info" ? (
        <>
          <NonAuthUserAdressForm
            defaultValues={
              data.cart?.shippingAddress
                ? {
                    addressLine1: shippingAddress.addressLine1,
                    addressLine2: shippingAddress.addressLine2,
                    cityId: shippingAddress.cityId || null,
                    countryId: shippingAddress.countryId || null,
                    email: shippingAddress.email || "",
                    addressType: shippingAddress.addressLocationType,
                    campaignCheckbox: true,
                    id: shippingAddress.id,
                    name: shippingAddress.name,
                    phone: shippingAddress.phone,
                    surname: shippingAddress.surname,
                    postalCode: null,
                    stateId: shippingAddress.stateId || null,
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
            onSubmit={async (body) => {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/set-unauth-shipping-address-to-cart/${cartId}`,
                {
                  method: "POST",
                  body: JSON.stringify(body), // { data } yerine sadece data
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
              refetch();
            }}
          />
          <Group gap={"sm"}>
            <ThemeIcon radius={"xl"} color="gray" size={"lg"}>
              <Text fz={"xl"} fw={700} ta={"center"} c={"white"}>
                2
              </Text>
            </ThemeIcon>
            <Text fz={"lg"} fw={600} c={"dimmed"}>
              Kargo
            </Text>
          </Group>
          <Divider />
          <Group gap={"sm"}>
            <ThemeIcon radius={"xl"} color="gray" size={"lg"}>
              <Text fz={"xl"} fw={700} ta={"center"} c={"white"}>
                3
              </Text>
            </ThemeIcon>
            <Text fz={"lg"} fw={600} c={"dimmed"}>
              Ödeme
            </Text>
          </Group>
        </>
      ) : step === "shipping" ? (
        <>
          <AddressCard
            data={shippingAddress}
            onEdit={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("step", "info" as CheckoutStep);
              replace(`?${params.toString()}`);
            }}
          />
          <ShippingStep
            cartId={cartId}
            onSubmit={async (ruleId) => {
              const body = {
                cartId,
                ruleId,
              };
              const req = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/set-shipping-address-to-cart`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json", // Bu eksikti
                  },
                  body: JSON.stringify({ body: body }),
                  credentials: "include",
                }
              );
              if (!req.ok) {
                notifications.show({
                  message: "Kargo seçimi yapılırken bir hata oluştu",
                  color: "red",
                  title: "Hata",
                  position: "bottom-right",
                });
                return;
              }

              const params = new URLSearchParams(searchParams.toString());
              params.set("step", "payment" as CheckoutStep);
              replace(`?${params.toString()}`, { scroll: false });
              refetch();
            }}
          />
        </>
      ) : step === "payment" ? (
        <>
          <AddressCard
            data={shippingAddress}
            onEdit={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("step", "info" as CheckoutStep);
              replace(`?${params.toString()}`);
            }}
          />
          <Divider />
          <ShippingCard
            cartData={{
              methodTitle: data.cart.cargoRule?.name || "Seçilmedi",
              price: data.cart.cargoRule?.price || 0,
              currency: data.cart.cargoRule.currency || "TRY",
            }}
            onEdit={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("step", "shipping" as CheckoutStep);
              replace(`?${params.toString()}`);
            }}
          />
          <Divider />
          <NonAuthUserPaymentForm
            cartId={cartId}
            refetch={refetch}
            billingAddress={
              billingAddress
                ? {
                    addressLine1: billingAddress.addressLine1,
                    addressLine2: billingAddress.addressLine2,
                    cityId: billingAddress.cityId || null,
                    countryId: billingAddress.countryId || null,
                    addressType: billingAddress.addressLocationType,
                    id: billingAddress.id,
                    name: billingAddress.name,
                    phone: billingAddress.phone,
                    surname: billingAddress.surname,
                    postalCode: null,
                    stateId: billingAddress.stateId || null,
                    isCorporateInvoice:
                      billingAddress.isCorporateInvoice || false,
                    companyName: billingAddress.companyName || null,
                    companyRegistrationAddress:
                      billingAddress.companyRegistrationAddress || null,
                    taxNumber: billingAddress.taxNumber || null,
                  }
                : data.cart.shippingAddress && {
                    addressLine1: shippingAddress.addressLine1,
                    addressLine2: shippingAddress.addressLine2,
                    cityId: shippingAddress.cityId || null,
                    countryId: shippingAddress.countryId || null,
                    addressType: shippingAddress.addressLocationType,
                    id: createId(),
                    name: shippingAddress.name,
                    phone: shippingAddress.phone,
                    surname: shippingAddress.surname,
                    postalCode: null,
                    stateId: shippingAddress.stateId || null,
                    isCorporateInvoice: false,
                    companyName: null,
                    companyRegistrationAddress: null,
                    taxNumber: null,
                  }
            }
            isShippingAddress={billingAddress ? false : true}
          />
        </>
      ) : null}
    </Stack>
  );
};

export default NonAuthUserCheckoutPage;
