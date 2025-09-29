"use client";
import { ActionIcon, AppShell, Burger, Group, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { SubmitHandler, useForm, zodResolver } from "@repo/shared";
import { MainPageComponentsSchema, MainPageComponentsType } from "@repo/types";
import {
  IconDeviceDesktop,
  IconDeviceIpad,
  IconDeviceMobile,
} from "@tabler/icons-react";
import GlobalLoadingOverlay from "../../../../components/GlobalLoadingOverlay";
import { useTheme } from "../ThemeContexts/ThemeContext";
import AdminThemeAside from "./AdminThemeAside";
import AdminThemeViewer from "./AdminThemeViewer";

interface AdminThemeLayoutShellProps {
  defaultValues: MainPageComponentsType | null;
  onSubmit?: SubmitHandler<MainPageComponentsType>;
  refetch?: () => void;
}

const AdminThemeLayoutShell = ({
  defaultValues,
  onSubmit,
}: AdminThemeLayoutShellProps) => {
  const { changeMedia, media } = useTheme();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { control, handleSubmit, formState, watch, setValue } =
    useForm<MainPageComponentsType>({
      resolver: zodResolver(MainPageComponentsSchema),
      defaultValues: defaultValues || {
        primaryColor: "#f06e27",

        components: [],
        footer: null,
      },
    });

  const data = watch();
  const getContainerStyles = (): React.CSSProperties => {
    switch (media) {
      case "mobile":
        return {
          width: "375px", // iPhone boyutu
          height: "812px", // iPhone boyutu
          maxWidth: "100%",
          maxHeight: "80vh",
          border: "3px solid #495057",
          borderRadius: "24px", // Telefon görünümü için
          margin: "0 auto", // Ortalamak için
        };
      case "tablet":
        return {
          width: "768px", // iPad boyutu
          height: "1024px", // iPad boyutu
          maxWidth: "100%",
          maxHeight: "80vh",
          border: "3px solid #495057",
          borderRadius: "12px", // Tablet görünümü için
          margin: "0 auto", // Ortalamak için
        };
      case "desktop":
      default:
        return {
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "0",
        };
    }
  };

  const containerStyles = getContainerStyles();

  return (
    <AppShell
      pt={"md"}
      px={"md"}
      pb={0}
      header={{ height: 60 }}
      navbar={{
        width: 400,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      {formState.isSubmitting && <GlobalLoadingOverlay />}
      <AppShell.Header>
        <Group h="100%" px="md" w={"100%"} justify="space-between">
          <Group align="center">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
          </Group>
          <Group>
            <ActionIcon
              variant={media === "mobile" ? "filled" : "default"}
              size="lg"
              onClick={() => changeMedia("mobile")}
            >
              <IconDeviceMobile />
            </ActionIcon>
            <ActionIcon
              variant={media === "tablet" ? "filled" : "default"}
              size="lg"
              onClick={() => changeMedia("tablet")}
            >
              <IconDeviceIpad />
            </ActionIcon>
            <ActionIcon
              variant={media === "desktop" ? "filled" : "default"}
              size="lg"
              onClick={() => changeMedia("desktop")}
            >
              <IconDeviceDesktop />
            </ActionIcon>
          </Group>
          <Group></Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <ScrollArea.Autosize
          scrollbarSize={6}
          type="scroll"
          scrollHideDelay={400}
          scrollbars="y"
        >
          {formState.errors && Object.keys(formState.errors).length > 0 && (
            <pre style={{ color: "red", fontSize: 12 }}>
              {JSON.stringify(formState.errors, null, 2)}
            </pre>
          )}
          <AdminThemeAside
            control={control}
            data={data}
            setValue={setValue}
            onSubmit={onSubmit}
            handleSubmit={handleSubmit}
            formState={formState}
          />
        </ScrollArea.Autosize>
      </AppShell.Navbar>
      <AppShell.Main>
        <ScrollArea style={containerStyles} className="bg-white  relative">
          <AdminThemeViewer data={data} />
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
};

export default AdminThemeLayoutShell;
