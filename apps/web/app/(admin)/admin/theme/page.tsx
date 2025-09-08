import { Stack, Title } from "@mantine/core";
import { IconColorPicker, IconSlideshow } from "@tabler/icons-react";
import AdminHoverCard, {
  AdminHoverCardProps,
} from "../../components/AdminHoverCard";

const ThemePage = () => {
  const data: AdminHoverCardProps[] = [
    {
      href: "/admin/theme/slider",
      title: "Slider Ayarları",
      description: "Anasayfa slider ayarlarını yapın",
      icon: <IconSlideshow />,
    },
    {
      href: "/admin/theme/colors",
      title: "Renk Ayarları",
      description: "Tema renklerini ayarlayın",
      icon: <IconColorPicker />,
    },
  ];
  return (
    <Stack gap={"lg"}>
      <Title order={3}>Tema Ayarları</Title>
      <AdminHoverCard data={data} />
    </Stack>
  );
};

export default ThemePage;
