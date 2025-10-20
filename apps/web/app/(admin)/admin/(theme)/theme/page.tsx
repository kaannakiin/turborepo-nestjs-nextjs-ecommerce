"use client";
import GlobalLoader from "@/components/GlobalLoader";
import fetchWrapper from "@lib/fetchWrapper";
import { notifications } from "@mantine/notifications";
import { SubmitHandler, useQuery } from "@repo/shared";
import { FontFamily, MainPageComponentsType } from "@repo/types";
import AdminThemeLayoutShell from "../components/AdminThemeLayoutShell";

const ThemePage = () => {
  const { data, isLoading, isFetching, isPending, refetch } = useQuery({
    queryKey: ["get-layout"],
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        components: MainPageComponentsType["components"];
        footer: MainPageComponentsType["footer"] | null;
      } | null>(`/admin/theme/get-layout?footer=true`, {});
      if (!res.success) {
        throw new Error("Layout verisi alınamadı");
      }
      return res.data;
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
            await fetchWrapper.post(`/admin/theme/delete-sliders`, {
              uniqueIds: slidersToDelete,
            });
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
              const res = await fetchWrapper.postFormData<{
                success: boolean;
                message?: string;
              }>(`/admin/theme/create-slider`, formData);

              if (!res.success) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }

              const result = res.data;

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

        const otherCompRes = await fetchWrapper.post(
          `/admin/theme/update-layout`,
          {
            components: otherComponents,
            footer: data.footer || undefined,
          }
        );

        if (!otherCompRes.success) {
          console.error("Diğer bileşenler güncelleme hatası:");
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
