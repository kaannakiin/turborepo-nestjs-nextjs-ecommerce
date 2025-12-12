"use client";
import { getThemePageCreatebleComponents } from "@lib/helpers";
import {
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { UseFormReturn, useWatch } from "@repo/shared";
import { ThemeInputType, ThemePages } from "@repo/types";
import {
  IconBrush,
  IconChevronRight,
  IconLayoutBottombar,
  IconLayoutNavbar,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { CreatebleSelectType } from "../../page";
import { useThemeStore } from "../../store/theme-store";
import HeaderComponent from "../navbar/section-components/HeaderComponent";
import ThemeSettingsComponent from "../navbar/section-components/ThemeSettingsComponent";
import { ComponentLibraryWrapper } from "./ComponentLibraryWrapper";
import SectionList from "./SectionList";
import SidebarHeader from "./SidebarHeader";

interface ThemeSidebarProps {
  forms: UseFormReturn<ThemeInputType>;
  createbleSelect: Array<CreatebleSelectType>;
}

const ThemeSidebar = ({ forms, createbleSelect }: ThemeSidebarProps) => {
  const { activePage, setSidebarView, sidebarView, setActivePage } =
    useThemeStore();

  const pages = useWatch({
    control: forms.control,
    name: "pages",
  });

  const activePageIndex =
    pages?.findIndex((p) => p.pageType === activePage) ?? -1;

  const filteredCreatebleSelect = useMemo(() => {
    const allowedTypes = new Set(getThemePageCreatebleComponents(activePage));
    return createbleSelect.filter((item) => allowedTypes.has(item.type));
  }, [activePage, createbleSelect]);

  const remountKey = `${activePage}-${activePageIndex}`;

  return (
    <>
      <SidebarHeader
        currentView={sidebarView}
        selectedPage={activePage}
        onPageChange={(v) => {
          if (v) setActivePage(v as ThemePages);
        }}
        onBack={() => setSidebarView("SECTIONS_LIST")}
      />

      <ScrollArea style={{ flex: 1 }}>
        {activePageIndex === -1 ? (
          <Text p="md" c="dimmed" size="sm" ta="center">
            Bu sayfa türü için yapılandırma bulunamadı.
          </Text>
        ) : (
          <>
            {sidebarView === "SECTIONS_LIST" && (
              <>
                <LayoutSectionButton
                  label="Tema Ayarları"
                  icon={<IconBrush size={18} />}
                  onClick={() => setSidebarView("THEME_SETTINGS")}
                />
                <LayoutSectionButton
                  label="Header"
                  icon={<IconLayoutNavbar size={18} />}
                  onClick={() => setSidebarView("HEADER")}
                />

                <Divider my="xs" />

                <SectionList
                  key={`list-${remountKey}`}
                  disabled={filteredCreatebleSelect.length === 0}
                  activePageIndex={activePageIndex}
                  onAddClick={() => setSidebarView("ADD_LIBRARY")}
                  control={forms.control}
                />

                <Divider my="xs" />

                <LayoutSectionButton
                  label="Footer"
                  icon={<IconLayoutBottombar size={18} />}
                  onClick={() => setSidebarView("FOOTER")}
                />
              </>
            )}

            {sidebarView === "ADD_LIBRARY" && (
              <ComponentLibraryWrapper
                key={`lib-${remountKey}`}
                control={forms.control}
                pageIndex={activePageIndex}
                createbleSelect={filteredCreatebleSelect}
              />
            )}

            {(sidebarView === "THEME_SETTINGS" ||
              sidebarView === "HEADER" ||
              sidebarView === "FOOTER") && (
              <Stack px="sm" pb="xl">
                {sidebarView === "THEME_SETTINGS" && (
                  <ThemeSettingsComponent control={forms.control} />
                )}
                {sidebarView === "HEADER" && <HeaderComponent />}

                {sidebarView === "FOOTER" && (
                  <div className="p-4">
                    <Text>Footer ayarları burada olacak</Text>
                  </div>
                )}
              </Stack>
            )}
          </>
        )}
      </ScrollArea>
    </>
  );
};

const LayoutSectionButton = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <UnstyledButton
      onClick={onClick}
      mx="sm"
      my="xs"
      px="md"
      py="sm"
      className="w-[calc(100%-24px)] rounded-lg border border-gray-200 bg-white 
                 hover:bg-gray-50 hover:border-gray-300 
                 transition-all duration-200 ease-in-out
                 hover:shadow-sm"
    >
      <Group justify="space-between">
        <Group gap="sm">
          <ThemeIcon variant="light" size="md" radius="md" color="gray">
            {icon}
          </ThemeIcon>
          <Text size="sm" fw={500}>
            {label}
          </Text>
        </Group>
        <IconChevronRight size={16} className="text-gray-400" />
      </Group>
    </UnstyledButton>
  );
};

export default ThemeSidebar;
