import { ReactNode } from "react";
import { getSession } from "../../lib/auth";
import UserAppShellLayout from "../components/UserAppShellLayout";

const UserLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  return (
    <UserAppShellLayout
      session={session}
    >
      {children}
    </UserAppShellLayout>
  );
};

export default UserLayout;
