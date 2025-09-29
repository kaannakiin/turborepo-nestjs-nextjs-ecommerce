"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { SubmitHandler, useQuery } from "@repo/shared";
import { FontFamily, MainPageComponentsType } from "@repo/types";
import AdminThemeLayoutShell from "../components/AdminThemeLayoutShell";
import { notifications } from "@mantine/notifications";
import GlobalLoader from "@/components/GlobalLoader";

const ThemePage = () => {
  const { data, isLoading, isFetching, isPending, refetch } = useQuery({
    queryKey: ["get-layout"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/theme/get-layout`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res?.ok) {
        console.error("Failed to fetch sliders:", res.statusText, res.status);
        return null;
      }
      const data = (await res.json()) as {
        components: MainPageComponentsType["components"];
        footer: MainPageComponentsType["footer"] | null;
      } | null;
      return data;
    },
  });

  if (isLoading || isFetching || isPending) {
    return <GlobalLoader />;
  }

  const onSubmit: SubmitHandler<MainPageComponentsType> = async (data) => {
    try {
      if (data.components && data.components.length > 0) {
        const currentSliders = data.components.find(
          (component) => component.type === "SLIDER"
        );

        const defaultSliders = data?.components
          ?.filter(Boolean)
          .find((component) => component.type === "SLIDER");

        // SLIDER İŞLEMLERİ
        if (currentSliders && currentSliders.data.length >= 0) {
          let slidersToDelete: string[] = [];

          if (defaultSliders?.data) {
            const currentSliderIds = currentSliders.data.map((s) => s.uniqueId);
            const defaultSliderIds = defaultSliders.data.map((s) => s.uniqueId);
            slidersToDelete = defaultSliderIds.filter(
              (defaultId) => !currentSliderIds.includes(defaultId)
            );
          }

          // Slider silme
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

          // Yeni slider ekleme/güncelleme
          let successCount = 0;
          let errorCount = 0;

          for (const [index, slider] of currentSliders.data.entries()) {
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

          // Slider işlem bildirimi
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
        }

        // DİĞER COMPONENTLER VE FOOTER GÜNCELLEME
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
            body: JSON.stringify({
              components: otherComponents,
              footer: data.footer || undefined,
            }),
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!otherCompRes.ok) {
          console.error(
            "Diğer bileşenler güncelleme hatası:",
            otherCompRes.statusText
          );
          throw new Error("Layout güncelleme başarısız");
        }
      }

      notifications.show({
        title: "Başarılı",
        message: "Tüm değişiklikler kaydedildi",
        color: "green",
        autoClose: 3000,
      });

      refetch();
    } catch (error) {
      console.error("İşlem hatası:", error);
      notifications.show({
        title: "Hata",
        message: "Değişiklikler kaydedilirken hata oluştu",
        color: "red",
        autoClose: 5000,
      });
    }
  };

  return (
    <>
      <AdminThemeLayoutShell
        defaultValues={{
          components: data?.components || [],
          footer: data?.footer || null,
          primaryColor: "#f06e27",
          secondaryColor: "#6672af",
          fontFamily: FontFamily.mantineDefault,
        }}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default ThemePage;
