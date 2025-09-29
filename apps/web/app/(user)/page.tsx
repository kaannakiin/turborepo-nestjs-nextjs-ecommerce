import AdminThemeViewer from "@/(admin)/admin/(theme)/components/AdminThemeViewer";
import { QueryClient } from "@repo/shared";
import { FontFamily, MainPageComponentsType } from "@repo/types";

const page = async () => {
  const client = new QueryClient();
  const layout = await client.fetchQuery({
    queryKey: ["get-layout"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/theme/get-layout?footer=false`,
        {
          method: "GET",
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
  if (!layout) {
    return <div></div>;
  }
  return (
    <AdminThemeViewer
      data={{
        ...layout,
        primaryColor: "#f06e27",
        secondaryColor: "#6672af",
        fontFamily: FontFamily.mantineDefault,
      }}
    />
  );
};

export default page;
