"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { $Enums } from "@repo/database";
import { useQuery } from "@repo/shared";
import {
  GetPaymentMethodResponseType,
  IyzicoPaymentMethodType,
  PayTRPaymentMethodType,
} from "@repo/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
const Iyzicoform = dynamic(() => import("./components/IyzicoForm"), {
  ssr: false,
  loading: () => <GlobalLoadingOverlay />,
});
const PayTRform = dynamic(() => import("./components/PayTrForm"), {
  ssr: false,
  loading: () => <GlobalLoadingOverlay />,
});
interface PaymentMethodInfo {
  type: $Enums.PaymentProvider;
  name: string;
  description: string;
  logo: string;
}

const paymentMethods: Array<PaymentMethodInfo> = [
  {
    type: "IYZICO",
    name: "Iyzico",
    description:
      "Tüm kredi kartları, banka kartları ve alternatif ödeme yöntemleriyle güvenli ve hızlı ödeme alın. Taksit seçenekleri, 3D Secure güvenlik ve anında onay özelliklerinden yararlanın.",
    logo: "/methods/iyzico-logo.png",
  },
  {
    type: "PAYTR",
    name: "PayTR",
    description:
      "Tüm kredi kartları, banka kartları ve alternatif ödeme yöntemleriyle güvenli ve hızlı ödeme alın. Taksit seçenekleri, 3D Secure güvenlik ve anında onay özelliklerinden yararlanın.",
    logo: "/methods/paytr-logo.png",
  },
];

const PaymentMethods = ({
  renderTitle,
  renderPayments,
}: {
  renderTitle?: boolean;
  renderPayments?: $Enums.PaymentProvider[];
}) => {
  const [opened, { open, close: mantineClose }] = useDisclosure();
  const [selectedMethod, setSelectedMethod] =
    useState<$Enums.PaymentProvider | null>(null);

  const {
    data: queryResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["adminPaymentMethod", selectedMethod],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetPaymentMethodResponseType>(
        `/admin/payments/payment-method/${selectedMethod}`
      );
      if (!res.success) {
        throw new Error("Failed to fetch payment method");
      }
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    },
    enabled: !!selectedMethod,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const onClickCards = (type: $Enums.PaymentProvider) => {
    setSelectedMethod(type);
    open();
  };

  const handleClose = () => {
    mantineClose();
    setSelectedMethod(null);
  };

  return (
    <>
      <Stack gap={"lg"}>
        {renderTitle && <Title order={3}>Mevcut Ödeme Yöntemleri</Title>}
        <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="md">
          {paymentMethods
            .filter(
              (method) =>
                !renderPayments || renderPayments.includes(method.type)
            )
            .map((method, index) => (
              <Card
                key={index}
                withBorder
                radius="md"
                onClick={() => {
                  onClickCards(method.type);
                }}
                padding="md"
                className="cursor-pointer hover:bg-[var(--mantine-primary-color-0)] transition-colors duration-200"
              >
                <Stack gap="sm" align="center">
                  <div className="relative w-full h-16 flex items-center justify-center rounded-md p-3">
                    <Image
                      src={method.logo}
                      alt={`${method.name} logo`}
                      fill
                      className="object-contain "
                    />
                  </div>
                  <div className="text-center">
                    <Text fw={600} size="xl">
                      {method.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {method.description}
                    </Text>
                  </div>
                </Stack>
              </Card>
            ))}
        </SimpleGrid>
      </Stack>

      {selectedMethod === "IYZICO" && (
        <Iyzicoform
          isLoading={isLoading}
          close={handleClose}
          opened={opened}
          refetch={refetch}
          defaultValues={queryResponse as IyzicoPaymentMethodType | undefined}
        />
      )}

      {selectedMethod === "PAYTR" && (
        <PayTRform
          isLoading={isLoading}
          close={handleClose}
          opened={opened}
          refetch={refetch}
          defaultValues={queryResponse as PayTRPaymentMethodType | undefined}
        />
      )}
    </>
  );
};

export default PaymentMethods;
