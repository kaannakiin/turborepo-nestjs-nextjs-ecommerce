'use client';
import LoadingOverlay from '@/components/LoadingOverlay';
import { usePaymentMethod } from '@hooks/admin/usePayments';
import {
  Card,
  SimpleGrid,
  Group,
  Button,
  Stack,
  Text,
  Title,
} from '@mantine/core'; // Added Group/Button
import { useDisclosure } from '@mantine/hooks';
import { PaymentProvider } from '@repo/database/client';
import { IyzicoPaymentMethodType, PayTRPaymentMethodType } from '@repo/types';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
const Iyzicoform = dynamic(() => import('./components/IyzicoForm'), {
  ssr: false,
  loading: () => <LoadingOverlay />,
});
const PayTRform = dynamic(() => import('./components/PayTrForm'), {
  ssr: false,
  loading: () => <LoadingOverlay />,
});
interface PaymentMethodInfo {
  type: PaymentProvider;
  name: string;
  description: string;
  logo: string;
}

const paymentMethods: Array<PaymentMethodInfo> = [
  {
    type: 'IYZICO',
    name: 'Iyzico',
    description:
      'Tüm kredi kartları, banka kartları ve alternatif ödeme yöntemleriyle güvenli ve hızlı ödeme alın. Taksit seçenekleri, 3D Secure güvenlik ve anında onay özelliklerinden yararlanın.',
    logo: '/methods/iyzico-logo.png',
  },
  {
    type: 'PAYTR',
    name: 'PayTR',
    description:
      'Tüm kredi kartları, banka kartları ve alternatif ödeme yöntemleriyle güvenli ve hızlı ödeme alın. Taksit seçenekleri, 3D Secure güvenlik ve anında onay özelliklerinden yararlanın.',
    logo: '/methods/paytr-logo.png',
  },
];

const PaymentMethods = ({
  renderTitle = true,
  renderPayments,
}: {
  renderTitle?: boolean;
  renderPayments?: PaymentProvider[];
}) => {
  const [opened, { open, close: mantineClose }] = useDisclosure();
  const [selectedMethod, setSelectedMethod] = useState<PaymentProvider | null>(
    null,
  );

  const {
    data: queryResponse,
    isLoading,
    refetch,
  } = usePaymentMethod(selectedMethod);

  const onClickCards = (type: PaymentProvider) => {
    setSelectedMethod(type);
    open();
  };

  const handleClose = () => {
    mantineClose();
    setSelectedMethod(null);
  };

  const { back } = useRouter();

  return (
    <>
      <Stack gap={'lg'}>
        {renderTitle && (
          <Group>
            <Button
              variant="subtle"
              size="sm"
              onClick={back}
              leftSection={<IconArrowLeft size={16} />}
            >
              Geri
            </Button>
            <Title order={3}>Mevcut Ödeme Yöntemleri</Title>
          </Group>
        )}
        <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="md">
          {paymentMethods
            .filter(
              (method) =>
                !renderPayments || renderPayments.includes(method.type),
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
                className="cursor-pointer hover:bg-(--mantine-primary-color-0) transition-colors duration-200"
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

      {selectedMethod === 'IYZICO' && (
        <Iyzicoform
          isLoading={isLoading}
          close={handleClose}
          opened={opened}
          refetch={refetch}
          defaultValues={queryResponse as IyzicoPaymentMethodType | undefined}
        />
      )}

      {selectedMethod === 'PAYTR' && (
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
