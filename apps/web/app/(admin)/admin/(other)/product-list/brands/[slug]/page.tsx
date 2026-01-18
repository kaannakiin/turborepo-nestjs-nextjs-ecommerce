'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import { useBrandDetail } from '@hooks/admin/useAdminBrands';
import { Alert, Button, Center, Group, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import BrandForm from '../components/BrandForm';

const BrandFormPage = () => {
  const params = useParams();
  const router = useRouter();
  const brandId = params.slug as string;

  const { data, isLoading, error } = useBrandDetail(brandId);

  if (brandId === 'new') {
    return <BrandForm />;
  }

  if (error) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md" maw={500}>
          <IconAlertCircle size={48} color="red" />
          <Text size="xl" fw={600}>
            Marka Yüklenemedi
          </Text>
          <Text c="dimmed" ta="center">
            Marka bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </Text>

          <Alert
            color="red"
            variant="light"
            w="100%"
            icon={<IconAlertCircle size={16} />}
          >
            {error instanceof Error
              ? error.message
              : 'Bilinmeyen bir hata oluştu'}
          </Alert>

          <Group>
            <Button variant="light" onClick={() => router.back()}>
              Geri Dön
            </Button>
            <Button component={Link} href="/admin/product-list/brands">
              Markalar Listesi
            </Button>
          </Group>
        </Stack>
      </Center>
    );
  }

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return <BrandForm defaultValues={data} />;
};

export default BrandFormPage;
