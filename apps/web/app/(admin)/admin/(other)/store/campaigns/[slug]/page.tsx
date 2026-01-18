'use client';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useParams } from 'next/navigation';
import CampaignForm from '../components/CampaignForm';
import { useAdminCampaignDetail } from '@hooks/admin/useAdminCampaigns';

const AdminCampaignFormPage = () => {
  const { slug } = useParams();

  const { data, isLoading } = useAdminCampaignDetail(slug as string);

  if (slug === 'new') {
    return <CampaignForm />;
  }

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!data) {
    return <div>Kampanya bulunamadı</div>;
  }

  return <CampaignForm defaultValues={data} />;
};

export default AdminCampaignFormPage;
