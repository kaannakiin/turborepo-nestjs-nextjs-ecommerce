'use client';
import LoadingOverlay from '@/components/LoadingOverlay';
import { usePaymentMethods } from '@hooks/admin/usePayments';
import { Alert, Button, Group, Stack, Text, Title } from '@mantine/core';
import { PaymentProvider } from '@repo/database/client';
import { IconInfoCircle } from '@tabler/icons-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import FormCard from '../../../../../components/cards/FormCard';
import PaymentMethods from './payment-methods/page';

const AdminPaymentsPage = () => {
  const { push } = useRouter();
  const { data, isLoading } = usePaymentMethods();

  const hasPaymentMethods = !isLoading && data && data.length > 0;

  const allProviders = Object.values(PaymentProvider);
  const addedProviders = data?.map((method) => method.type) ?? [];
  const allProvidersAdded = data
    ? allProviders.every((provider) => addedProviders.includes(provider))
    : false;

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Stack gap={'xl'}>
        {!hasPaymentMethods && (
          <Alert
            variant="light"
            color="blue"
            title="Ödeme Sistemi Kurulumu"
            icon={<IconInfoCircle />}
          >
            <Text size="sm">
              Ödeme ayarlarını yapılandırabilmek için öncelikle en az bir ödeme
              yöntemi eklemeniz gerekmektedir. İyzico, PayTR gibi ödeme
              sağlayıcılarını ekledikten sonra, her bir yöntem için özel
              koşullar ve kurallar belirleyebilirsiniz.
            </Text>
          </Alert>
        )}
        <FormCard
          title={
            <Group p={'md'} justify="space-between" align="center">
              <Title order={4}>
                {!allProvidersAdded
                  ? 'Ödeme Yöntemleri'
                  : 'Eklenmiş Ödeme Yöntemleri'}
              </Title>
              {hasPaymentMethods && !allProvidersAdded && (
                <Group gap={'md'}>
                  <Button
                    onClick={() => {
                      push('/admin/settings/payments/payment-methods' as Route);
                    }}
                  >
                    Ödeme Yöntemi Ekle
                  </Button>
                </Group>
              )}
            </Group>
          }
        >
          {!hasPaymentMethods ? (
            <div className="flex flex-col min-h-24 justify-center items-center gap-3">
              <Text fz={'lg'} fw={700}>
                Henüz bir ödeme yöntemi eklenmedi
              </Text>
              <Button
                variant="filled"
                onClick={() => {
                  push('/admin/settings/payments/payment-methods' as Route);
                }}
              >
                Ödeme Yöntemi Ekle
              </Button>
            </div>
          ) : (
            <PaymentMethods
              renderTitle={false}
              renderPayments={data.map((d) => d.type)}
            />
          )}
        </FormCard>
        <FormCard title="Ödeme Ayarları">
          <div className="flex flex-col min-h-24 justify-center items-center gap-3">
            <Text fz={'lg'} fw={700} className="text-center">
              Ödeme ayarlarını yapılandırarak müşterilerinize farklı ödeme
              yöntemleri sunabilirsiniz.
            </Text>
            <Button
              variant="filled"
              disabled={!hasPaymentMethods}
              onClick={() => {
                push('/admin/settings/payments/payment-rules' as Route);
              }}
            >
              Ödeme Kurallarını Yönet
            </Button>
            {!hasPaymentMethods && (
              <Text size="sm" c="dimmed" className="text-center">
                Ödeme ayarı eklemek için önce bir ödeme yöntemi eklemelisiniz
              </Text>
            )}
          </div>
        </FormCard>
      </Stack>
    </>
  );
};
export default AdminPaymentsPage;
