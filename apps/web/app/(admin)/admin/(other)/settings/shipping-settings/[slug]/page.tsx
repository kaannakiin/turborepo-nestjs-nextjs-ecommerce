'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import { useGetCargoZone } from '@hooks/admin/useShipping';
import { Button, Center, Stack, Text } from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import ShippingForm from '../components/ShippingForm';

const ShippingFormPage = () => {
  const params = useParams();
  const { push } = useRouter();
  const slug = params.slug as string;
  const { data, isLoading, isError } = useGetCargoZone(slug);

  if (slug === 'new') {
    return <ShippingForm />;
  }

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isError || !data) {
    return (
      <Center h={400}>
        <Stack gap="md" align="center">
          <Text size="lg" c="dimmed">
            Kargo bölgesi bulunamadı
          </Text>
          <Button onClick={() => push('/admin/settings/shipping-settings')}>
            Geri Dön
          </Button>
        </Stack>
      </Center>
    );
  }

  return <ShippingForm defaultValues={data} />;
};

export default ShippingFormPage;
