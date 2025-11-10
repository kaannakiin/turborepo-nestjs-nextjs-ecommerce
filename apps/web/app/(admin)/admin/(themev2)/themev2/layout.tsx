"use client";
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Card,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useFieldArray, useForm, zodResolver } from "@repo/shared";
import {
  createComponent,
  ThemeComponents,
  ThemeInputType,
  ThemeSchema,
  ThemeV2DefaultValues,
} from "@repo/types";
import {
  IconCarouselHorizontalFilled,
  IconDeviceImac,
  IconDeviceIpadHorizontal,
  IconDeviceMobile,
  IconMarquee2,
  IconPlus,
} from "@tabler/icons-react";
import { ReactNode } from "react";
import { Media, useTheme } from "../../(theme)/ThemeContexts/ThemeContext";
import AsideFormsTable from "./components/AsideFormsTable";
import NavbarComponentTable from "./components/NavbarComponentTable";

const themeIcons: Array<{
  key: Media;
  icon: ReactNode;
  label: string;
  width: string;
}> = [
  {
    icon: <IconDeviceImac />,
    key: "desktop",
    label: "Masaüstü",
    width: "100%",
  },
  {
    icon: <IconDeviceIpadHorizontal />,
    key: "tablet",
    label: "Tablet",
    width: "768px",
  },
  {
    icon: <IconDeviceMobile />,
    key: "mobile",
    label: "Mobil",
    width: "375px",
  },
];

const createbleSelect: Array<{
  type: ThemeComponents;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    type: "MARQUEE",
    label: "Marquee",
    description: "Kayan yazı bandı",
    icon: <IconMarquee2 size={32} />,
  },
  {
    type: "SLIDER",
    label: "Slider",
    description: "Resim ve video slayt gösterisi",
    icon: <IconCarouselHorizontalFilled size={32} />,
  },
];

const headerHeight = 60;
const footerHeight = 60;

const ThemeV2Layout = ({ children }: { children: ReactNode }) => {
  const [
    openedComponentSelect,
    { open: openComponentSelect, close: closeComponentselect },
  ] = useDisclosure();

  const [adminSidebar, setAdminSidebar] = useLocalStorage({
    key: "themeV2-admin-sidebar",
    defaultValue: true,
  });

  const [opened, { toggle }] = useDisclosure(adminSidebar, {
    onClose: () => setAdminSidebar(false),
    onOpen: () => setAdminSidebar(true),
  });

  const { changeMedia, media } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ThemeInputType>({
    resolver: zodResolver(ThemeSchema),
    defaultValues: ThemeV2DefaultValues,
  });

  const currentWidth =
    themeIcons.find((icon) => icon.key === media)?.width ?? "100%";

  const showBorder = media !== "desktop";

  const { fields, append } = useFieldArray({
    control,
    name: "components",
    keyName: "rhf_id",
  });

  const handleAddComponent = (type: ThemeComponents) => {
    const nextOrder = fields.length;

    const newComponent = createComponent(nextOrder, type);

    append(newComponent);

    closeComponentselect();
  };

  return (
    <>
      <AppShell
        layout={media === "desktop" ? "alt" : "default"}
        transitionDuration={300}
        transitionTimingFunction="linear"
        header={{ height: headerHeight }}
        footer={{ height: footerHeight }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened, desktop: !opened },
        }}
        aside={{
          breakpoint: "md",
          width: 300,
          collapsed: { mobile: !opened, desktop: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" align="center" justify="space-between">
            <Group h="100%" align="center">
              <Burger opened={opened} onClick={toggle} size="sm" />
            </Group>
            <Group
              gap={"xs"}
              align="center"
              visibleFrom="sm"
              className="border-2 p-1 border-[var(--mantine-primary-color-5)] rounded-md overflow-hidden "
            >
              {themeIcons.map((themeIcon) => (
                <ActionIcon
                  key={themeIcon.key}
                  size={"lg"}
                  color="admin"
                  variant={media === themeIcon.key ? "filled" : "transparent"}
                  onClick={() => {
                    changeMedia(themeIcon.key);
                  }}
                >
                  <Tooltip label={themeIcon.label} position="bottom" withArrow>
                    {themeIcon.icon}
                  </Tooltip>
                </ActionIcon>
              ))}
            </Group>
            <Group visibleFrom="sm" gap={"md"} align="center">
              <Button variant="outline">Vazgeç</Button>
              <Button variant="filled">Kaydet</Button>
            </Group>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar bg={"gray.0"}>
          <ScrollArea pl={"0"} scrollbarSize={5} px={"xs"}>
            <NavbarComponentTable key={fields.length} control={control} />
            <Group align="center" justify="center" py="md">
              <Button leftSection={<IconPlus />} onClick={openComponentSelect}>
                Yeni Bölüm
              </Button>
            </Group>
          </ScrollArea>
        </AppShell.Navbar>
        <AppShell.Main className="flex flex-col">
          <div
            style={{ maxWidth: currentWidth }}
            className={`mx-auto flex-1 transition-all w-full duration-300 ease-in-out ${
              showBorder
                ? "border-2 border-[var(--mantine-primary-color-5)] rounded-lg overflow-hidden"
                : ""
            }`}
          >
            {children}
          </div>
        </AppShell.Main>

        <AppShell.Aside bg={"gray.0"} p="md">
          <ScrollArea pr={"md"} scrollbarSize={6}>
            <AsideFormsTable control={control} />
          </ScrollArea>
        </AppShell.Aside>
        <AppShell.Footer p="md">Footer</AppShell.Footer>
      </AppShell>
      <Drawer
        opened={openedComponentSelect}
        onClose={closeComponentselect}
        title="Bölüm Ekle"
        position="left"
        size={"sm"}
        zIndex={10000}
        classNames={{
          header: "border-b border-gray-400",
          title: "font-semibold",
        }}
      >
        <Stack gap="md" py={"xs"}>
          {createbleSelect.map((comp) => (
            <Card
              key={comp.type}
              withBorder
              padding="sm"
              radius={"md"}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleAddComponent(comp.type)}
            >
              <Group gap="md" wrap="nowrap">
                <ThemeIcon variant="transparent" size="md">
                  {comp.icon}
                </ThemeIcon>
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text fw={600} size="sm">
                    {comp.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {comp.description}
                  </Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </Drawer>
    </>
  );
};

export default ThemeV2Layout;
