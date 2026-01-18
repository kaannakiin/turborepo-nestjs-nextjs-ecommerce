'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import { Alert, Center, Text } from '@mantine/core';
import { BaseProductZodType, VariantProductZodType } from '@repo/types';
import { IconAlertCircle } from '@tabler/icons-react';
import { useParams, useSearchParams } from 'next/navigation';
import BasicProductForm from '../components/BasicProductForm';
import VariantProductForm from '../components/VariantProductForm';
import { useGetProduct } from '@hooks/admin/useProducts';

function isVariantProduct(
  product: BaseProductZodType | VariantProductZodType,
): product is VariantProductZodType {
  return (product as VariantProductZodType).combinatedVariants !== undefined;
}

const AdminProductFormPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const isCreateMode = params.slug === 'new';

  const isCreateVariantMode =
    isCreateMode && searchParams.get('variant') === 'true';

  const {
    isLoading,
    isError,
    error,
    data: product,
  } = useGetProduct(params.slug as string, !isCreateMode && !!params.slug);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isError) {
    return (
      <Center h={400}>
        <Alert
          variant="light"
          color="red"
          title="Hata Oluştu"
          icon={<IconAlertCircle />}
        >
          {error instanceof Error ? error.message : 'Ürün verisi yüklenemedi.'}
        </Alert>
      </Center>
    );
  }

  if (isCreateMode) {
    if (isCreateVariantMode) {
      return <VariantProductForm />;
    }

    return <BasicProductForm />;
  }

  if (!product) {
    return <Text c="red">Ürün bulunamadı.</Text>;
  }

  if (isVariantProduct(product)) {
    return <VariantProductForm defaultValues={product} />;
  }

  return <BasicProductForm defaultValues={product} />;
};

export default AdminProductFormPage;
