import { ReactNode } from "react";
import UserAppShellLayout from "../components/UserAppShellLayout";

const UserLayout = ({ children }: { children: ReactNode }) => {
  return <UserAppShellLayout>{children} </UserAppShellLayout>;
};

export default UserLayout;
