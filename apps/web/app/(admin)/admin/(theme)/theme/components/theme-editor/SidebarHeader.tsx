import { getThemePageLabel } from "@lib/helpers";
import { ActionIcon, AppShell, Group, Select, Text } from "@mantine/core";
import { ThemePages } from "@repo/types";
import { IconArrowLeft, IconLayoutSidebar } from "@tabler/icons-react";
import { SidebarView } from "../../store/theme-store";

const viewConfig: Record<
  Exclude<SidebarView, "SECTIONS_LIST">,
  { title: string }
> = {
  ADD_LIBRARY: { title: "Yeni Bölüm Ekle" },
  HEADER: { title: "Header Ayarları" },
  FOOTER: { title: "Footer Ayarları" },
  THEME_SETTINGS: { title: "Tema Ayarları" },
};

const SidebarHeader = ({
  currentView,
  onBack,
  selectedPage,
  onPageChange,
}: {
  currentView: SidebarView;
  onBack: () => void;
  selectedPage: string;
  onPageChange: (val: string | null) => void;
}) => {
  const isMainView = currentView === "SECTIONS_LIST";

  return (
    <AppShell.Section
      p="md"
      mb="xs"
      classNames={{
        section: "border-b border-b-gray-300",
      }}
    >
      {isMainView ? (
        <Select
          value={selectedPage}
          onChange={onPageChange}
          data={Object.values(ThemePages).map((key) => ({
            value: key,
            label: getThemePageLabel(key),
          }))}
          allowDeselect={false}
          leftSection={<IconLayoutSidebar size={16} />}
        />
      ) : (
        <Group>
          <ActionIcon variant="subtle" color="gray" onClick={onBack}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text fw={600} size="sm">
            {viewConfig[currentView].title}
          </Text>
        </Group>
      )}
    </AppShell.Section>
  );
};

export default SidebarHeader;
