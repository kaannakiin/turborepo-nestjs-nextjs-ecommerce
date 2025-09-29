"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import {
  Button,
  Group,
  Radio,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useQuery } from "@repo/shared";
import { ShippingMethodsResponse } from "@repo/types";
import { IconCheck } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ShippingStepProps {
  cartId: string;
  onSubmit: (ruleId: string) => Promise<void>;
}

const ShippingStep = ({ cartId, onSubmit }: ShippingStepProps) => {
  const { push, replace } = useRouter();
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = useSearchParams();
  const { data, isLoading, isPending, isFetching } = useQuery({
    queryKey: ["get-available-shipping-methods", cartId],
    queryFn: async () => {
      const req = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/shipping/get-available-shipping-methods/${cartId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!req.ok) {
        return null;
      }
      const data = (await req.json()) as ShippingMethodsResponse;
      if (data.success) {
        return data.shippingMethods;
      } else {
        return null;
      }
    },
  });

  useEffect(() => {
    if (data?.rules?.length && !selectedRuleId) {
      setSelectedRuleId(data.rules[0].id);
    }
  }, [data?.rules, selectedRuleId]);

  if (isLoading || isPending || isFetching) {
    return <GlobalLoadingOverlay />;
  }

  return (
    <>
      <Group gap={"sm"} align="start" visibleFrom="sm">
        <Group gap={"sm"} align="center">
          <ThemeIcon radius={"xl"} color="black" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"}>
              2
            </Text>
          </ThemeIcon>
        </Group>
        {data && data.rules && data.rules.length > 0 ? (
          <Stack gap={"lg"} className="flex-1">
            <Text fw={600} size="lg">
              Kargo
            </Text>
            <Radio.Group>
              {data.rules.map((rule) => (
                <Radio.Card
                  checked={selectedRuleId === rule.id}
                  onClick={() => {
                    setSelectedRuleId(rule.id);
                  }}
                  key={rule.id}
                  bg={"#F7F7F9"}
                  className="border border-gray-900 "
                  radius={"md"}
                  px={"xs"}
                  py={"md"}
                >
                  <Group align="center" justify="space-between">
                    <Group gap={"md"} align="center">
                      <Radio.Indicator
                        icon={IconCheck}
                        color={"black"}
                        classNames={{
                          icon: "size-4",
                        }}
                        size="md"
                      />
                      <Text fw={500} fz={"md"}>
                        {rule.name}
                      </Text>
                    </Group>
                    <>
                      {rule.price > 0 ? (
                        <ProductPriceFormatter
                          price={rule.price}
                          currency={rule.currency}
                        />
                      ) : (
                        <Text>Ücretsiz</Text>
                      )}
                    </>
                  </Group>
                </Radio.Card>
              ))}
            </Radio.Group>
            {errorMessage && (
              <Text c={"red"} fz={"md"}>
                {errorMessage}
              </Text>
            )}
            <Button
              size="lg"
              radius={"md"}
              variant="filled"
              color="black"
              onClick={async () => {
                if (!selectedRuleId) {
                  setErrorMessage("Lütfen bir kargo seçeneği seçin");
                  setTimeout(() => {
                    setErrorMessage(null);
                  }, 3000);
                  return;
                }
                await onSubmit(selectedRuleId);
              }}
            >
              Ödeme ile Devam Et
            </Button>
          </Stack>
        ) : (
          <Stack>
            <Text fw={500} fz={"lg"}>
              Maalesef, seçtiğiniz konuma kargo seçeneği sunulamıyor.
            </Text>
            <UnstyledButton
              ta={"center"}
              className="hover:underline hover:underline-offset-4 transition-all duration-200"
              onClick={() => {
                const pageParams = new URLSearchParams(params.toString());
                pageParams.set("step", "info");
                replace(`?${pageParams.toString()}`);
              }}
            >
              <Text fw={500} fz={"lg"}>
                Adresinizi düzenleyin
              </Text>
            </UnstyledButton>
          </Stack>
        )}
      </Group>
      <Stack gap={"xs"} hiddenFrom="sm">
        <Group gap={"sm"} align="center">
          <ThemeIcon radius={"xl"} color="black" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"}>
              2
            </Text>
          </ThemeIcon>
          <Text fw={600} size="lg">
            Kargo
          </Text>
        </Group>
        {data && data.rules && data.rules.length > 0 ? (
          <Stack gap={"lg"} className="flex-1">
            <Radio.Group pt={"md"}>
              {data.rules.map((rule) => (
                <Radio.Card
                  checked={selectedRuleId === rule.id}
                  onClick={() => {
                    setSelectedRuleId(rule.id);
                  }}
                  key={rule.id}
                  bg={"#F7F7F9"}
                  className="border border-gray-900 "
                  radius={"md"}
                  px={"xs"}
                  py={"md"}
                >
                  <Group align="center" justify="space-between">
                    <Group gap={"md"} align="center">
                      <Radio.Indicator
                        icon={IconCheck}
                        color={"black"}
                        classNames={{
                          icon: "size-4",
                        }}
                        size="md"
                      />
                      <Text fw={500} fz={"md"}>
                        {rule.name}
                      </Text>
                    </Group>
                    <>
                      {rule.price > 0 ? (
                        <ProductPriceFormatter
                          price={rule.price}
                          currency={rule.currency}
                        />
                      ) : (
                        <Text>Ücretsiz</Text>
                      )}
                    </>
                  </Group>
                </Radio.Card>
              ))}
            </Radio.Group>
            {errorMessage && (
              <Text c={"red"} fz={"md"}>
                {errorMessage}
              </Text>
            )}
            <Button
              size="lg"
              radius={"md"}
              variant="filled"
              color="black"
              onClick={async () => {
                if (!selectedRuleId) {
                  setErrorMessage("Lütfen bir kargo seçeneği seçin");
                  setTimeout(() => {
                    setErrorMessage(null);
                  }, 3000);
                  return;
                }
                await onSubmit(selectedRuleId);
              }}
            >
              Ödeme ile Devam Et
            </Button>
          </Stack>
        ) : (
          <Stack>
            <Text fw={500} fz={"lg"}>
              Maalesef, seçtiğiniz konuma kargo seçeneği sunulamıyor.
            </Text>
            <UnstyledButton
              ta={"center"}
              className="hover:underline hover:underline-offset-4 transition-all duration-200"
              onClick={() => {
                const pageParams = new URLSearchParams(params.toString());
                pageParams.set("step", "info");
                replace(`?${pageParams.toString()}`);
              }}
            >
              <Text fw={500} fz={"lg"}>
                Adresinizi düzenleyin
              </Text>
            </UnstyledButton>
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default ShippingStep;
