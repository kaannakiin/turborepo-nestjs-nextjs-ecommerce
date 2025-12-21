"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure, useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { TokenPayload } from "@repo/types";
import { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSpotlight from "./AdminSpotlight";

const AdminAppShellLayout = ({
  children,
  session,
}: {
  children: ReactNode;
  session: TokenPayload;
}) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();

  const [navbarCollapsed, setNavbarCollapsed] = useLocalStorage({
    key: "admin-navbar-collapsed",
    defaultValue: false,
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleNavItemClick = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  const handleToggleCollapse = () => {
    setNavbarCollapsed((prev) => !prev);
  };

  // Navbar genişliği: collapsed ise 70px, değilse 280px
  const navbarWidth = navbarCollapsed ? 70 : 280;

  return (
    <>
      <AdminSpotlight />
      <AppShell
        padding="md"
        navbar={{
          width: navbarWidth,
          breakpoint: "sm",
          collapsed: { mobile: !mobileOpened, desktop: false },
        }}
      >
        <AppShell.Navbar className="overflow-hidden border-r border-slate-200/60">
          <AdminNavbar
            session={session}
            collapsed={navbarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onNavItemClick={handleNavItemClick}
          />
        </AppShell.Navbar>

        <AppShell.Main className="bg-slate-50/50">{children}</AppShell.Main>
      </AppShell>
    </>
  );
};

export default AdminAppShellLayout;
