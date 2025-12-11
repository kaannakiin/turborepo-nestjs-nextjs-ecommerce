"use client";

import { getThemePageLabel } from "@lib/helpers";
import {
  ActionIcon,
  AppShell,
  Button,
  Divider,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import {
  Control,
  useFieldArray,
  UseFieldArrayReturn,
  UseFormReturn,
  useWatch,
} from "@repo/shared";
import {
  createComponent,
  ThemeComponents,
  ThemeInputType,
  ThemePages,
} from "@repo/types";
import {
  IconArrowLeft,
  IconLayoutSidebar,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { CreatebleSelectType } from "../../page";
import { SidebarView, useThemeStore } from "../../store/theme-store";
import NavbarComponentTable from "../NavbarComponentTable";

interface ThemeSidebarProps {
  forms: UseFormReturn<ThemeInputType>;
  createbleSelect: Array<CreatebleSelectType>;
}

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
  if (currentView === "SECTIONS_LIST") {
    return (
      <AppShell.Section
        p="md"
        mb={"xs"}
        classNames={{
          section: "border-b border-b-gray-300",
        }}
      >
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
      </AppShell.Section>
    );
  }

  return (
    <Stack gap="xs" p="md" pb="xs">
      <Group>
        <ActionIcon variant="subtle" color="gray" onClick={onBack}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Text fw={600} size="sm">
          {currentView === "ADD_LIBRARY" ? "Yeni Bölüm Ekle" : "Ayarlar"}
        </Text>
      </Group>
      <Divider mt="xs" />
    </Stack>
  );
};

const SectionList = ({
  onAddClick,
  control,
  activePageIndex,
  functions,
}: {
  control: Control<ThemeInputType>;
  onAddClick: () => void;
  activePageIndex: number;
  functions: UseFieldArrayReturn<
    ThemeInputType,
    `pages.${number}.components`,
    "rhf_id"
  >;
}) => {
  return (
    <Stack gap={4} px="sm" pb="xl">
      <Group justify="space-between" px="xs" py={4}>
        <Text size="xs" fw={700} c="dimmed">
          BÖLÜMLER ({functions?.fields?.length})
        </Text>
      </Group>
      <NavbarComponentTable
        activePageIndex={activePageIndex}
        control={control}
        functions={functions}
      />
      <Button
        variant="light"
        fullWidth
        mt="md"
        leftSection={<IconPlus size={16} />}
        onClick={onAddClick}
        color="blue"
        radius="md"
      >
        Bölüm Ekle
      </Button>
    </Stack>
  );
};

const ComponentLibrary = ({
  items,
  onSelect,
}: {
  items: CreatebleSelectType[];
  onSelect: (type: ThemeComponents) => void;
}) => {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  return (
    <Stack px="sm" pb="xl">
      <TextInput
        placeholder="Bölüm ara..."
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="xs"
      />

      {filteredItems.map((comp) => (
        <UnstyledButton
          key={comp.type}
          onClick={() => onSelect(comp.type)}
          className="hover:bg-gray-100 p-3 rounded-md transition-colors border border-transparent hover:border-gray-200"
        >
          <Group wrap="nowrap" align="flex-start">
            <ThemeIcon size="lg" variant="light" radius="md">
              {comp.icon}
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600}>
                {comp.label}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {comp.description}
              </Text>
            </div>
            <ThemeIcon variant="transparent" c="dimmed">
              <IconPlus size={16} />
            </ThemeIcon>
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  );
};

const ThemeSidebar = ({ forms, createbleSelect }: ThemeSidebarProps) => {
  const { activePage, setActivePage, sidebarView, setSidebarView } =
    useThemeStore();

  const pages = useWatch({
    control: forms.control,
    name: "pages",
  });

  const activePageIndex = useMemo(() => {
    return pages?.findIndex((p) => p.pageType === activePage) ?? -1;
  }, [pages, activePage]);

  const componentsFieldArray = useFieldArray({
    control: forms.control,
    name: `pages.${activePageIndex}.components`,
    keyName: "rhf_id",
  });

  const handleAddComponent = (type: ThemeComponents) => {
    const nextOrder = componentsFieldArray.fields.length;
    const newComponent = createComponent(nextOrder, type);

    componentsFieldArray.append(newComponent);

    setSidebarView("SECTIONS_LIST");
  };

  if (activePageIndex === -1)
    return <div>Sayfa verisi yükleniyor veya bulunamadı...</div>;

  return (
    <>
      <SidebarHeader
        currentView={sidebarView}
        selectedPage={activePage}
        onPageChange={(v) => {
          if (v) {
            setActivePage(v as ThemePages);
          }
        }}
        onBack={() => setSidebarView("SECTIONS_LIST")}
      />

      <ScrollArea style={{ flex: 1 }}>
        {sidebarView === "SECTIONS_LIST" && (
          <SectionList
            key={activePage}
            activePageIndex={activePageIndex}
            functions={componentsFieldArray}
            onAddClick={() => setSidebarView("ADD_LIBRARY")}
            control={forms.control}
          />
        )}

        {sidebarView === "ADD_LIBRARY" && (
          <ComponentLibrary
            items={createbleSelect}
            onSelect={handleAddComponent}
          />
        )}
      </ScrollArea>
    </>
  );
};

export default ThemeSidebar;
