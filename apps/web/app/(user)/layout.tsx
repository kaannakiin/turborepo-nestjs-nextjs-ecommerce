import { queryClient } from "@lib/serverQueryClient";
import { CategoryHeaderData } from "@repo/types";
import { ReactNode } from "react";
import { getSession } from "../../lib/auth";
import UserAppShellLayout from "../components/UserAppShellLayout";

const UserLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();
  const headerCategoryData: CategoryHeaderData[] | null =
    await queryClient.fetchQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.BACKEND_URL}/user-page/main-page-header-categories`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          console.log(response.status);
          return null;
        }

        const data = (await response.json()) as CategoryHeaderData[];
        return data;
      },
    });
  return (
    <UserAppShellLayout
      session={session}
      headerCategoryData={headerCategoryData}
    >
      {children}
    </UserAppShellLayout>
  );
};

export default UserLayout;
