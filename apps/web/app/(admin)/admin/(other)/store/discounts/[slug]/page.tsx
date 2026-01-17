'use client';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useAdminDiscountDetail } from '@hooks/admin/useAdminDiscounts';
import { useParams } from 'next/navigation';
import DiscountForm from '../components/DiscountForm';

const DiscountFormPage = () => {
  const params = useParams();
  const { slug } = params;
  const { data, isLoading } = useAdminDiscountDetail(slug as string);

  if (slug === 'new') {
    return <DiscountForm />;
  }
  if (isLoading) {
    return <LoadingOverlay />;
  }
  if (!data) {
    return <div>İndirim Bulunamadı.</div>;
  }
  return <DiscountForm defaultValues={data} />;
};

export default DiscountFormPage;
