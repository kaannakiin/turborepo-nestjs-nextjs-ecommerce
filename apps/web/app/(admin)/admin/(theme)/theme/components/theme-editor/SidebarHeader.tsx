import React from "react";
import { SidebarView } from "../../store/theme-store";
import {
  AppShell,
  Select,
  Stack,
  Group,
  ActionIcon,
  Text,
  Divider,
} from "@mantine/core";
import { IconLayoutSidebar, IconArrowLeft } from "@tabler/icons-react";
import { getThemePageLabel } from "@lib/helpers";
import { ThemePages } from "@repo/types";

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
  return (
    <AppShell.Section
      p="md"
      mb={"xs"}
      classNames={{
        section: "border-b border-b-gray-300",
      }}
    >
      {currentView === "SECTIONS_LIST" ? (
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
            {currentView === "ADD_LIBRARY" ? "Yeni Bölüm Ekle" : "Ayarlar"}
          </Text>
        </Group>
      )}
    </AppShell.Section>
  );
};

export default SidebarHeader;
