"use client";
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Card,
  Collapse,
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
  IconX,
} from "@tabler/icons-react";
import { ReactNode, useState } from "react";
import { Media, useTheme } from "../../(theme)/ThemeContexts/ThemeContext";
import AsideFormsTable from "./components/AsideFormsTable";
import NavbarComponentTable from "./components/NavbarComponentTable";
import ThemeSorter from "./ThemeSorter";

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
  {
    type: "PRODUCT_CAROUSEL",
    label: "Ürün Görseli",
    description: "Ürün Görseli",
    icon: <IconCarouselHorizontalFilled size={32} />,
  },
];

const headerHeight = 60;
const footerHeight = 60;

const ThemeV2 = () => {
  const [mode, setMode] = useState<
    "default" | "addSection" | "header" | "footer"
  >("default");

  const [adminSidebar, setAdminSidebar] = useLocalStorage({
    key: "themeV2-admin-sidebar",
    defaultValue: true,
  });

  const [opened, { toggle }] = useDisclosure(adminSidebar, {
    onClose: () => setAdminSidebar(false),
    onOpen: () => setAdminSidebar(true),
  });

  const { changeMedia, media } = useTheme();

  const forms = useForm<ThemeInputType>({
    resolver: zodResolver(ThemeSchema),
    defaultValues: ThemeV2DefaultValues,
  });

  const currentWidth =
    themeIcons.find((icon) => icon.key === media)?.width ?? "100%";

  const showBorder = media !== "desktop";

  const componontsFieldArray = useFieldArray({
    control: forms.control,
    name: "components",
    keyName: "rhf_id",
  });

  const handleAddComponent = (type: ThemeComponents) => {
    const nextOrder = componontsFieldArray.fields.length;

    const newComponent = createComponent(nextOrder, type);

    componontsFieldArray.append(newComponent);

    setMode("default");
  };

  const componentOrderKey = componontsFieldArray.fields
    .map((field) => field.rhf_id)
    .join("-");

  return (
    <>
      <AppShell
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
              className="border-2 p-1 border-(--mantine-primary-color-5) rounded-md overflow-hidden "
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
            <Collapse
              transitionDuration={300}
              transitionTimingFunction="linear"
              in={mode === "default"}
            >
              <div>
                <NavbarComponentTable
                  key={componentOrderKey}
                  control={forms.control}
                  functions={componontsFieldArray}
                />
                <Group align="center" justify="center" py="md">
                  <Button
                    leftSection={<IconPlus />}
                    onClick={() => setMode("addSection")}
                  >
                    Yeni Bölüm
                  </Button>
                </Group>
              </div>
            </Collapse>

            <Collapse
              transitionDuration={300}
              transitionTimingFunction="linear"
              in={mode === "addSection"}
            >
              <Stack p="md">
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>Bölüm Ekle</Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setMode("default");
                    }}
                    aria-label="Kapat"
                  >
                    <IconX size={18} />
                  </ActionIcon>
                </Group>

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
            </Collapse>
            <Collapse
              in={mode === "header"}
              transitionDuration={300}
              transitionTimingFunction="linear"
            >
              <Stack p="md">
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>Header Ayarları</Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => {
                      setMode("default");
                    }}
                    aria-label="Kapat"
                  >
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Collapse>
          </ScrollArea>
        </AppShell.Navbar>
        <AppShell.Main className="flex flex-col" bg={"gray.2"}>
          <div
            style={{ maxWidth: currentWidth }}
            className={`mx-auto flex-1 transition-all w-full duration-300 ease-in-out bg-white ${
              showBorder ? "shadow-xl overflow-hidden rounded-none" : ""
            }`}
          >
            <ThemeSorter key={componentOrderKey} control={forms.control} />
          </div>
        </AppShell.Main>

        <AppShell.Aside bg={"gray.0"} p="md">
          <ScrollArea pr={"md"} scrollbarSize={6}>
            <AsideFormsTable forms={forms} />
          </ScrollArea>
        </AppShell.Aside>
        <AppShell.Footer p="md">Footer</AppShell.Footer>
      </AppShell>
    </>
  );
};

export default ThemeV2;
