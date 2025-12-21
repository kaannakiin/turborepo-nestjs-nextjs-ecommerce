import AdminAppShellLayout from "@/(admin)/components/admin-layout/AdminAppShellLayout";
import { getSession } from "@lib/auth";
import { UserRole } from "@repo/database";
import { notFound } from "next/navigation";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) {
    return notFound();
  }

  if ((session.role as UserRole) === "USER") {
    notFound();
  }

  return (
    <AdminAppShellLayout session={session}>{children}</AdminAppShellLayout>
  );
};

export default AdminLayout;
