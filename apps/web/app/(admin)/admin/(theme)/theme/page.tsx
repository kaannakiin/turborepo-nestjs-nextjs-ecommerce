import { QueryClient } from "@repo/shared";
import { FontFamily, MainPageComponentsType } from "@repo/types";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AdminThemeLayoutShell from "../components/AdminThemeLayoutShell";

const page = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return notFound();
  }

  const client = new QueryClient();
  const data = await client.fetchQuery({
    queryKey: ["get-layout"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.BACKEND_URL}/admin/theme/get-layout`,
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
    gcTime: 0,
    staleTime: Infinity,
    retry: false,
  });

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
      />
    </>
  );
};

export default page;
