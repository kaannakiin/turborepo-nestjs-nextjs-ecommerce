import { ReactNode, Suspense } from "react";
import { getSession } from "../../lib/auth";
import UserAppShellLayout from "../components/UserAppShellLayout";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";

const UserLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  return (
    <UserAppShellLayout session={session}>
      <Suspense fallback={<GlobalLoadingOverlay />}>{children}</Suspense>
    </UserAppShellLayout>
  );
};

export default UserLayout;
