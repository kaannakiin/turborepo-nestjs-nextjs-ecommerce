"use client";

import { ScrollArea, Text } from "@mantine/core";
import { UseFormReturn, useWatch } from "@repo/shared";
import { ThemeInputType, ThemePages } from "@repo/types";
import { CreatebleSelectType } from "../../page";
import { useThemeStore } from "../../store/theme-store";
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

  if (activePageIndex === -1) {
    return (
      <Text p="md" c="dimmed" size="sm" ta="center">
        Bu sayfa türü için yapılandırma bulunamadı.
      </Text>
    );
  }

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
        {sidebarView === "SECTIONS_LIST" && (
          <SectionList
            key={`list-${remountKey}`}
            activePageIndex={activePageIndex}
            onAddClick={() => setSidebarView("ADD_LIBRARY")}
            control={forms.control}
          />
        )}

        {sidebarView === "ADD_LIBRARY" && (
          <ComponentLibraryWrapper
            key={`lib-${remountKey}`}
            control={forms.control}
            pageIndex={activePageIndex}
            createbleSelect={createbleSelect}
          />
        )}
      </ScrollArea>
    </>
  );
};

export default ThemeSidebar;
