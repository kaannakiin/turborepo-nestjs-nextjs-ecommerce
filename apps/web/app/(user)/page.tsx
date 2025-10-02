"use client";
import AdminThemeViewer from "@/(admin)/admin/(theme)/components/AdminThemeViewer";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import FetchWrapperV2 from "@lib/fetchWrapper-v2";
import { useQuery } from "@repo/shared";
import { FontFamily, MainPageComponentsType } from "@repo/types";

const UserPage = () => {
  const { data, isLoading, isPending, isFetching } = useQuery({
    queryKey: ["get-layout"],
    queryFn: async () => {
      const api = new FetchWrapperV2();
      const layout = await api.get<{
        components: MainPageComponentsType["components"];
        footer: MainPageComponentsType["footer"] | null;
      } | null>(
        `${process.env.BACKEND_URL}/admin/theme/get-layout?footer=false`
      );
      if (!layout.success) {
        return null;
      }
      return layout.data;
    },
  });

  if (!data) {
    return <div></div>;
  }
  if (isLoading || isPending || isFetching) {
    return <GlobalLoadingOverlay />;
  }
  return (
    <AdminThemeViewer
      data={{
        ...data,
        primaryColor: "#f06e27",
        secondaryColor: "#6672af",
        fontFamily: FontFamily.mantineDefault,
      }}
    />
  );
};

export default UserPage;
