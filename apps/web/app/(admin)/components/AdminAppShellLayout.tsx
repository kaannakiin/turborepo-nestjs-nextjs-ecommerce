"use client";
import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure, useLocalStorage, useMediaQuery } from "@mantine/hooks";
import { TokenPayload } from "@repo/types";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";

const AdminAppShellLayout = ({ children, session }: { children: ReactNode; session: TokenPayload }) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();

  const [navbarState, setNavbarState] = useLocalStorage({
    key: "admin-navbar-opened",
    defaultValue: true,
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleNavItemClick = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  const toggleDesktop = () => {
    setNavbarState(!navbarState);
  };

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !navbarState },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" align="center" justify="space-between">
          <Group gap={"lg"} h={"100%"} align="center" justify="flex-start">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="md" />
            <Burger opened={navbarState} onClick={toggleDesktop} visibleFrom="sm" size="md" />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="flex flex-col gap-0">
        <AdminNavbar onNavItemClick={handleNavItemClick} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AdminAppShellLayout;
