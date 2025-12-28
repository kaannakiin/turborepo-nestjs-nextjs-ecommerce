"use client";

import PriceFormatter from "@/(user)/components/PriceFormatter";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
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
  GetCartClientCheckoutReturnType,
  ShippingMethodsResponse,
} from "@repo/types";
import { IconCheck } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddressCard from "../AddressCard";
import { useTheme } from "@/context/theme-context/ThemeContext";

interface AuthUserShippingListProps {
  cart: Pick<GetCartClientCheckoutReturnType, "cart">;
}
const AuthUserShippingList = ({ cart }: AuthUserShippingListProps) => {
  const { actualMedia: media } = useTheme();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [selectedCargoRuleId, setSelectedCargoRuleId] = useState<string | null>(
    cart.cart?.cargoRule?.id || null
  );
  const [loading, setLoading] = useState(false);
  const {
    data: shippingRules,
    isFetching: shippingRulesIsFetching,
    isLoading: shippingRulesIsLoading,
    isPending: shippingRulesIsPending,
  } = useQuery({
    queryKey: ["shipping-rules", cart?.cart?.cartId],
    queryFn: async () => {
      const res = await fetchWrapper.get<ShippingMethodsResponse>(
        `/shipping/get-available-shipping-methods/${cart?.cart?.cartId}`
      );
      if (!res.success) throw new Error("Failed to fetch shipping methods");
      return res.data.shippingMethods;
    },
    enabled: !!cart?.cart?.cartId,
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
        data={cart?.cart?.shippingAddress}
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
          shippingRules.rules.length > 0 ? (
            shippingRules.rules.map((rule) => (
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
                {rule && rule.price === 0 ? (
                  <Text> Ücretsiz Kargo</Text>
                ) : (
                  <PriceFormatter price={rule.price} />
                )}
              </Group>
            ))
          ) : (
            <Text>
              Maalesef adresinize bir kargo tanımlanmamıştır. Satıcıyla
              görüşebilirsiniz. Ya da başka bir adres belirtebilirsiniz.
            </Text>
          )}
          <Button
            fullWidth
            size="lg"
            radius={"md"}
            variant="filled"
            color="black"
            disabled={!selectedCargoRuleId || loading}
            onClick={async () => {
              setLoading(true);
              if (!selectedCargoRuleId) {
                setLoading(false);
                return;
              }
              const res = await fetchWrapper.put<{
                success: boolean;
                message: string;
              }>(`/cart/set-cart-cargo-rule`, {
                cartId: cart?.cart?.cartId,
                cargoRuleId: selectedCargoRuleId,
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
              setLoading(false);
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

export default AuthUserShippingList;
