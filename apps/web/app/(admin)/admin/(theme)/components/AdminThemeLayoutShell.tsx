"use client";
import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Group,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { SubmitHandler, useForm, zodResolver } from "@repo/shared";
import {
  FontFamily,
  MainPageComponentsSchema,
  MainPageComponentsType,
} from "@repo/types";
import {
  IconDeviceDesktop,
  IconDeviceIpad,
  IconDeviceMobile,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import GlobalLoadingOverlay from "../../../../components/GlobalLoadingOverlay";
import { useTheme } from "../ThemeContexts/ThemeContext";
import AdminThemeAside from "./AdminThemeAside";
import AdminThemeViewer from "./AdminThemeViewer";

interface AdminThemeLayoutShellProps {
  defaultValues: MainPageComponentsType | null;
}

const AdminThemeLayoutShell = ({
  defaultValues,
}: AdminThemeLayoutShellProps) => {
  const { changeMedia, media } = useTheme();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { control, handleSubmit, formState, watch } =
    useForm<MainPageComponentsType>({
      resolver: zodResolver(MainPageComponentsSchema),
      defaultValues: defaultValues || {
        primaryColor: "#f06e27",
        secondaryColor: "#6672af",
        fontFamily: FontFamily.mantineDefault,
      },
    });

  const data = watch();
  const { refresh } = useRouter();
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
  const onSubmit: SubmitHandler<MainPageComponentsType> = async (data) => {
    if (data.components && data.components.length > 0) {
      const currentSliders = data.components.find(
        (component) => component.type === "SLIDER"
      );

      const defaultSliders = defaultValues?.components
        ?.filter(Boolean)
        .find((component) => component.type === "SLIDER");

      if (currentSliders && currentSliders.data.length >= 0) {
        try {
          let slidersToDelete: string[] = [];

          if (defaultSliders?.data) {
            // Current slider ID'leri al (hem mevcut hem yeni olanlar)
            const currentSliderIds = currentSliders.data.map((s) => s.uniqueId);

            // Default'ta olup current'ta OLMAYAN slider'lar gerçekten silinmiş
            const defaultSliderIds = defaultSliders.data.map((s) => s.uniqueId);

            slidersToDelete = defaultSliderIds.filter(
              (defaultId) => !currentSliderIds.includes(defaultId)
            );
          }

          // 2. Silinecek slider'lar varsa sil
          if (slidersToDelete.length > 0) {
            await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/theme/delete-sliders`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  uniqueIds: slidersToDelete,
                }),
                credentials: "include",
                cache: "no-store",
              }
            );
          }

          // 3. Yeni asset'i olan slider'ları ekle/güncelle
          let successCount = 0;
          let errorCount = 0;

          for (const [index, slider] of currentSliders.data.entries()) {
            // Sadece yeni asset'i olan slider'ları işle
            if (!slider.desktopAsset && !slider.mobileAsset) {
              continue;
            }

            const formData = new FormData();

            if (slider.desktopAsset) {
              formData.append("desktopAsset", slider.desktopAsset);
            }
            if (slider.mobileAsset) {
              formData.append("mobileAsset", slider.mobileAsset);
            }

            formData.append("order", (index + 1).toString());
            formData.append("customLink", slider.customLink || "");
            formData.append("uniqueId", slider.uniqueId);
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/theme/create-slider`,
                {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  body: formData,
                }
              );

              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }

              const result = await res.json();

              if (result.success) {
                successCount++;
              } else {
                errorCount++;
                console.error(`Slider ${index + 1} hatası:`, result.message);
              }
            } catch (error) {
              errorCount++;
              console.error(`Slider ${index + 1} yükleme hatası:`, error);
            }
          }

          // 4. Sonuç bildirimi
          let message = "";
          if (slidersToDelete.length > 0) {
            message += `${slidersToDelete.length} slider silindi`;
          }
          if (successCount > 0) {
            if (message) message += ", ";
            message += `${successCount} slider eklendi`;
          }
          if (errorCount > 0) {
            if (message) message += ", ";
            message += `${errorCount} hata`;
          }

          if (message) {
            notifications.show({
              title: errorCount > 0 ? "Kısmi Başarı" : "Başarılı",
              message: message,
              color: errorCount > 0 ? "yellow" : "green",
              autoClose: 5000,
            });
          }

          refresh();
        } catch (error) {
          console.error("Slider işlemi genel hatası:", error);
          notifications.show({
            title: "Hata",
            message: "Slider işlemi sırasında hata oluştu",
            color: "red",
            autoClose: 5000,
          });
        }
      }
      const otherComponents = data.components.filter(
        (component) => component.type !== "SLIDER"
      );
      const otherCompRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/theme/update-layout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ components: otherComponents }), // components olarak gönder
          credentials: "include",
          cache: "no-store",
        }
      );
      if (!otherCompRes.ok) {
        console.error(
          "Diğer bileşenler güncelleme hatası:",
          otherCompRes.statusText
        );
      }
    }
  };

  return (
    <AppShell
      padding="md"
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
            onSubmit={onSubmit}
            handleSubmit={handleSubmit}
            formState={formState}
          />
        </ScrollArea.Autosize>
      </AppShell.Navbar>
      <AppShell.Main>
        <ScrollArea style={containerStyles} className="bg-white pb-5 relative">
          <AdminThemeViewer data={data} />
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
};

export default AdminThemeLayoutShell;
