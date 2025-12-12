"use client";
import { Media, useTheme } from "@/context/theme-context/ThemeContext";
import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useForm, zodResolver } from "@repo/shared";
import {
  ThemeComponents,
  ThemeInputType,
  ThemeSchema,
  createDefaultTheme,
} from "@repo/types";
import {
  IconCarouselHorizontalFilled,
  IconDeviceImac,
  IconDeviceIpadHorizontal,
  IconDeviceMobile,
  IconMarquee2,
} from "@tabler/icons-react";
import { ReactNode } from "react";
import AsideFormsTable from "./components/aside/AsideFormsTable";
import ThemeEditorHeader from "./components/theme-editor/ThemeEditorHeader";
import ThemeSidebar from "./components/theme-editor/ThemeSidebar";
import ThemeSorter from "./ThemeSorter";
export type CreatebleSelectType = {
  type: ThemeComponents;
  label: string;
  description: string;
  icon: ReactNode;
};
export type ThemeIconsType = {
  key: Media;
  icon: ReactNode;
  label: string;
  width: string;
};

const themeIcons: Array<ThemeIconsType> = [
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

const createbleSelect: Array<CreatebleSelectType> = [
  {
    type: "SLIDER",
    label: "Slider",
    description: "Resim ve video slayt gösterisi",
    icon: <IconCarouselHorizontalFilled size={32} />,
  },
  {
    type: "MARQUEE",
    label: "Marquee",
    description: "Kayan yazı bandı",
    icon: <IconMarquee2 size={32} />,
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

const ThemePage = () => {
  const [adminSidebar, setAdminSidebar] = useLocalStorage({
    key: "themeV2-admin-sidebar",
    defaultValue: true,
  });

  const [opened, { toggle }] = useDisclosure(adminSidebar, {
    onClose: () => setAdminSidebar(false),
    onOpen: () => setAdminSidebar(true),
  });

  const { media } = useTheme();

  const forms = useForm<ThemeInputType>({
    resolver: zodResolver(ThemeSchema),
    defaultValues: createDefaultTheme(),
  });

  const currentWidth =
    themeIcons.find((icon) => icon.key === media)?.width ?? "100%";

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
          <ThemeEditorHeader
            opened={opened}
            themeIcons={themeIcons}
            toggle={toggle}
          />
        </AppShell.Header>
        <AppShell.Navbar bg={"gray.0"}>
          <ThemeSidebar createbleSelect={createbleSelect} forms={forms} />
        </AppShell.Navbar>
        <AppShell.Main className="flex flex-col" bg={"gray.2"}>
          <div
            style={{ maxWidth: currentWidth }}
            className={`mx-auto flex-1 transition-all w-full duration-300 ease-in-out bg-white`}
          >
            <ThemeSorter control={forms.control} />
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

export default ThemePage;
