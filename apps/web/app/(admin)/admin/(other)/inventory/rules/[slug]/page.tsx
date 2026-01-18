'use client';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useInventoryRuleDetail } from '@hooks/admin/useInventory';
import { useParams } from 'next/navigation';
import { Activity } from 'react';
import InventroyRuleForm from '../components/InventroyRuleForm';

const InventoryRuleFormPage = () => {
  const params = useParams();
  const isEdit = params?.slug !== 'new' && Boolean(params?.slug);
  const { data, isFetching, isLoading } = useInventoryRuleDetail(
    params!.slug as string,
    {
      enabled: isEdit,
    },
  );

  if (isFetching || isLoading) {
    return (
      <Activity mode="visible">
        <LoadingOverlay />
      </Activity>
    );
  }

  if (!isEdit) {
    return <InventroyRuleForm />;
  }

  return (
    <>
      <InventroyRuleForm defaultValues={data} />
    </>
  );
};

export default InventoryRuleFormPage;
