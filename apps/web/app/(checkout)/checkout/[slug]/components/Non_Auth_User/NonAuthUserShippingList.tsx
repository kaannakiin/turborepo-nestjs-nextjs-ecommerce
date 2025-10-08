"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Button,
  Divider,
  Group,
  Radio,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@repo/shared";
import {
  GetUserCartInfoForCheckoutReturn,
  ShippingMethodsResponse,
} from "@repo/types";
import { IconCheck } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddressCard from "../AddressCard";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";

interface NonAuthUserShippingListProps {
  cart: GetUserCartInfoForCheckoutReturn;
}

const NonAuthUserShippingList = ({ cart }: NonAuthUserShippingListProps) => {
  const { media } = useTheme();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [selectedCargoRuleId, setSelectedCargoRuleId] = useState<string | null>(
    cart.cargoRuleId || null
  );
  const [loading, setLoading] = useState(false);
  const {
    data: shippingRules,
    isFetching: shippingRulesIsFetching,
    isLoading: shippingRulesIsLoading,
    isPending: shippingRulesIsPending,
  } = useQuery({
    queryKey: ["shipping-rules", cart.id],
    queryFn: async () => {
      const res = await fetchWrapper.get<ShippingMethodsResponse>(
        `/shipping/get-available-shipping-methods/${cart.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!res.success) throw new Error("Failed to fetch shipping methods");
      return res.data.shippingMethods;
    },
    enabled: !!cart.id,
  });

  useEffect(() => {
    if (
      shippingRules &&
      shippingRules.rules &&
      shippingRules.rules.length > 0
    ) {
      const ruleExists = selectedCargoRuleId
        ? shippingRules.rules.some((rule) => rule.id === selectedCargoRuleId)
        : false;

      if (!ruleExists) {
        setSelectedCargoRuleId(shippingRules.rules[0].id);
      }
    }
  }, [shippingRules, selectedCargoRuleId]);

  return (
    <Stack gap={"lg"}>
      {(shippingRulesIsFetching ||
        shippingRulesIsLoading ||
        shippingRulesIsPending ||
        loading) && <GlobalLoadingOverlay />}
      <AddressCard
        data={cart.shippingAddress}
        onEdit={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("step", "info");
          replace(`?${params.toString()}`);
        }}
      />
      <Divider size={"md"} />
      <Stack gap={"sm"} align="start">
        <Group align="center" gap={"sm"}>
          <ThemeIcon radius={"xl"} color="black" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"}>
              2
            </Text>
          </ThemeIcon>
          <Text fz={"lg"} fw={600}>
            Kargo
          </Text>
        </Group>
        <Stack
          gap={"sm"}
          pl={media === "desktop" ? 40 : 0}
          className="w-full flex-1"
        >
          {shippingRules &&
          shippingRules.rules &&
          shippingRules.rules.length > 0
            ? shippingRules.rules.map((rule) => (
                <Group
                  key={rule.id}
                  bg={"#F7F7F9"}
                  justify="space-between"
                  align="center"
                  py={"md"}
                  px={"lg"}
                  onClick={() => {
                    if (selectedCargoRuleId === rule.id) return;
                    setSelectedCargoRuleId(rule.id);
                  }}
                  className="w-full border-gray-900 border-2 gap-2 rounded-md"
                >
                  <Group gap={"xs"} align="center">
                    <Radio.Indicator
                      icon={IconCheck}
                      checked={selectedCargoRuleId === rule.id}
                      color={"black"}
                      classNames={{
                        icon: "size-4",
                      }}
                      size="md"
                    />
                    <Text>{rule.name}</Text>
                  </Group>
                  {rule.price === 0 ? (
                    <Text fz={"md"} fw={700}>
                      Ücretsiz
                    </Text>
                  ) : (
                    <ProductPriceFormatter
                      price={rule.price}
                      fz={"md"}
                      fw={700}
                    />
                  )}
                </Group>
              ))
            : null}
          <Button
            fullWidth
            size="lg"
            radius={"md"}
            variant="filled"
            color="black"
            onClick={async () => {
              try {
                setLoading(true);
                if (!selectedCargoRuleId) return;
                const res = await fetchWrapper.put<{
                  success: boolean;
                  message: string;
                }>(`/cart-v3/set-cart-cargo-rule`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    cartId: cart.id,
                    cargoRuleId: selectedCargoRuleId,
                  }),
                });
                if (!res.success) {
                  notifications.show({
                    title: "Hata",
                    message: "Kargo kuralı seçilirken bir hata oluştu",
                    color: "red",
                  });
                  return;
                }

                if (!res.success) {
                  notifications.show({
                    title: "Hata",
                    message: "Kargo kuralı seçilirken bir hata oluştu",
                    color: "red",
                  });
                } else {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("step", "payment");
                  replace(`?${params.toString()}`);
                }
              } catch (error) {
                console.error(error);
              } finally {
                setLoading(false);
              }
            }}
          >
            Ödeme ile Devam Et
          </Button>
        </Stack>
      </Stack>
      <Divider size={"md"} />
      <Group gap={"xl"}>
        <Group align="center" gap={"sm"}>
          <ThemeIcon radius={"xl"} color="gray.3" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"} c={"dimmed"}>
              3
            </Text>
          </ThemeIcon>
          <Text fz={"lg"} fw={600} c={"dimmed"}>
            Ödeme
          </Text>
        </Group>
      </Group>
    </Stack>
  );
};

export default NonAuthUserShippingList;
