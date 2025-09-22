import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { getSession } from "../../../../lib/auth";
import AdminAppShellLayout from "../../components/AdminAppShellLayout";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  if (!session) {
    return notFound();
  }

  return (
    <AdminAppShellLayout session={session}>{children}</AdminAppShellLayout>
  );
};

export default AdminLayout;
