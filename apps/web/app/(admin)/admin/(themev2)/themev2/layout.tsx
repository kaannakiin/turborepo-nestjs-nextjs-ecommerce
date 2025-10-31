"use client";
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Group,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useForm, zodResolver } from "@repo/shared";
import {
  ThemeV2DefaultValues,
  ThemeV2Schema,
  ThemeV2SchemaType,
} from "@repo/types";
import {
  IconDeviceImac,
  IconDeviceIpadHorizontal,
  IconDeviceMobile,
} from "@tabler/icons-react";
import Image from "next/image";
import { ReactNode } from "react";
import { Media, useTheme } from "../../(theme)/ThemeContexts/ThemeContext";
import logo from "../../../../../public/logo.svg";

// 1. ADIM: themeIcons array'ini güncelliyoruz
const themeIcons: Array<{
  key: Media;
  icon: ReactNode;
  label: string;
  width: string;
}> = [
  {
    icon: <IconDeviceImac />,
    key: "desktop",
    label: "Desktop (Genişlik: Auto)",
    width: "100%",
  },
  {
    icon: <IconDeviceIpadHorizontal />,
    key: "tablet",
    label: "Tablet (Genişlik: 768px)",
    width: "768px",
  },
  {
    icon: <IconDeviceMobile />,
    key: "mobile",
    label: "Mobil (Genişlik: 375px)",
    width: "375px",
  },
];

const headerHeight = 60;
const footerHeight = 60;

const ThemeV2Layout = ({ children }: { children: ReactNode }) => {
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
  } = useForm<ThemeV2SchemaType>({
    resolver: zodResolver(ThemeV2Schema),
    defaultValues: ThemeV2DefaultValues,
  });

  const currentWidth =
    themeIcons.find((icon) => icon.key === media)?.width ?? "100%";

  const showBorder = media !== "desktop";

  return (
    <AppShell
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

            <div className="relative h-full">
              <Image
                src={logo}
                alt="logo"
                height={40}
                width={0}
                style={{ width: "auto", height: "100%" }}
                className="object-contain"
              />
            </div>
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
        <AppShell.Section
          p={"sm"}
          className="border-b text-center font-bold text-lg"
        >
          Anasayfa
          {/* BURAYA SELECT GELECEK SAYFA SEÇEBİLECEK */}
        </AppShell.Section>
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
        Aside
      </AppShell.Aside>
      <AppShell.Footer p="md">Footer</AppShell.Footer>
    </AppShell>
  );
};

export default ThemeV2Layout;
