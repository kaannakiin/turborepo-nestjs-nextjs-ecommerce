import AdminHoverCard, {
  AdminHoverCardProps,
} from "@/(admin)/components/AdminHoverCard";
import { Stack } from "@mantine/core";
import { IconCreditCard, IconMail, IconTruck } from "@tabler/icons-react";

const AdminSettingsPage = () => {
  const data: AdminHoverCardProps[] = [
    {
      href: "/admin/settings/shipping-settings",
      title: "Kargo Ayarları",
      description: "Kargo ayarlarınızı yönetmek için tıklayın.",
      icon: <IconTruck size={32} stroke={1.5} />,
    },
    {
      href: "/admin/settings/emails",
      title: "Mail Ayarları",
      description: " Mail ayarlarınızı yönetmek için tıklayın.",
      icon: <IconMail size={32} stroke={1.5} />,
    },
    {
      href: "/admin/settings/payments",
      title: "Ödeme Ayarları",
      description: "Ödeme ayarlarınızı yönetmek için tıklayın.",
      icon: <IconCreditCard size={32} stroke={1.5} />,
    },
  ];
  return (
    <Stack gap={"lg"}>
      <AdminHoverCard data={data} />
    </Stack>
  );
};

export default AdminSettingsPage;
