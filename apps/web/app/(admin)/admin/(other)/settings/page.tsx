'use client';
import AdminHoverCard, {
  AdminHoverCardProps,
} from '@/(admin)/components/AdminHoverCard';
import { Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBuilding,
  IconCreditCard,
  IconMail,
  IconTruck,
} from '@tabler/icons-react';
import StoreDrawer from '../components/StoreDrawer';

const AdminSettingsPage = () => {
  const [storeOpened, { open: openStore, close: closeStore }] =
    useDisclosure(false);

  const data: AdminHoverCardProps[] = [
    {
      title: 'Mağaza Ayarları',
      description: 'B2B ve B2C mağaza ayarlarınızı yönetmek için tıklayın.',
      icon: <IconBuilding size={32} stroke={1.5} />,
      onClick: openStore,
    },
    {
      href: '/admin/settings/shipping-settings',
      title: 'Kargo Ayarları',
      description: 'Kargo ayarlarınızı yönetmek için tıklayın.',
      icon: <IconTruck size={32} stroke={1.5} />,
    },
    {
      href: '/admin/settings/emails',
      title: 'Mail Ayarları',
      description: ' Mail ayarlarınızı yönetmek için tıklayın.',
      icon: <IconMail size={32} stroke={1.5} />,
    },
    {
      href: '/admin/settings/payments',
      title: 'Ödeme Ayarları',
      description: 'Ödeme ayarlarınızı yönetmek için tıklayın.',
      icon: <IconCreditCard size={32} stroke={1.5} />,
    },
  ];

  return (
    <Stack gap={'lg'}>
      <AdminHoverCard data={data} />
      <StoreDrawer
        opened={storeOpened}
        onClose={closeStore}
        size="100%"
        title="Mağaza Ayarları"
        classNames={{
          title: 'text-xl font-semibold',
          header: 'border-b border-gray-400',
          body: 'mt-2',
        }}
        closeButtonProps={{
          size: 'lg',
        }}
        position="bottom"
      />
    </Stack>
  );
};

export default AdminSettingsPage;
