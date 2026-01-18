'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import { useCategoryDetail } from '@hooks/admin/useAdminCategories';
import { Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminCategoryForm from '../components/AdminCategoryForm';

const AdminCategoriesFormPage = () => {
  const params = useParams();
  const categoryId = params.slug as string;

  const { data, isLoading, error, refetch } = useCategoryDetail(categoryId);

  if (categoryId === 'new') {
    return <AdminCategoryForm />;
  }

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <>
        <Alert
          color="red"
          title="Kategori Yüklenemedi"
          icon={<IconAlertCircle />}
          mb="md"
        >
          {error instanceof Error
            ? error.message
            : 'Kategori bilgileri yüklenirken bir hata oluştu'}
        </Alert>

        <Button.Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            variant="light"
          >
            Tekrar Dene
          </Button>
          <Button component={Link} href="/admin/product-list/categories">
            Kategoriler Listesi
          </Button>
        </Button.Group>
      </>
    );
  }

  return <AdminCategoryForm defaultValues={data} />;
};

export default AdminCategoriesFormPage;
