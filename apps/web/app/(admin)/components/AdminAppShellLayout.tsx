"use client";
import { AppShell, Avatar, Burger, Group, Text } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useMediaQuery } from "@mantine/hooks";
import { TokenPayload } from "@repo/types";
import { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";
import { usePathname } from "next/navigation";
import AdminThemeAside from "./AdminThemeAside";

const AdminAppShellLayout = ({
  children,
  session,
}: {
  children: ReactNode;
  session: TokenPayload;
}) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();

  // localStorage ile navbar durumunu kaydet
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

  const pathname = usePathname();
  const isThemeAdmin = pathname.startsWith("/admin/theme");

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !navbarState },
      }}
      aside={{
        width: isThemeAdmin ? 300 : 0,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" align="center" justify="space-between">
          <Group gap={"lg"} h={"100%"} align="center" justify="flex-start">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="md"
            />
            <Burger
              opened={navbarState}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="md"
            />
            {/* Rest of header */}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="flex flex-col gap-4">
        <AdminNavbar onNavItemClick={handleNavItemClick} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      {isThemeAdmin && (
        <AppShell.Aside p="md">
          <AdminThemeAside />
        </AppShell.Aside>
      )}
    </AppShell>
  );
};

export default AdminAppShellLayout;
