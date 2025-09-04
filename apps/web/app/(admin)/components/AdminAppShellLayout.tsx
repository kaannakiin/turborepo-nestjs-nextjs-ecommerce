"use client";
import { AppShell, Avatar, Burger, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMediaQuery } from "@mantine/hooks";
import { TokenPayload } from "@repo/types";
import { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";

const AdminAppShellLayout = ({
  children,
  session,
}: {
  children: ReactNode;
  session: TokenPayload;
}) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleNavItemClick = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Header>
        {/* Mevcut header kodunuz */}
        <Group h="100%" px="md" align="center" justify="space-between">
          <Group gap={"lg"} h={"100%"} align="center" justify="flex-start">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="md"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="md"
            />
            <Group wrap="nowrap" align="center" gap={"md"} visibleFrom="sm">
              <Avatar radius="xl" />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {session.name}
                </Text>
                <Text c="dimmed" size="xs">
                  {session.email ? session.email : session.phone}
                </Text>
              </div>
            </Group>
          </Group>
          <div className="relative h-full w-24 py-2 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <div className="w-4 h-4 bg-white rounded-sm opacity-90"></div>
              </div>
              <Text
                size="lg"
                fw={700}
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Admin
              </Text>
            </div>
          </div>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar className="flex flex-col gap-4">
        <AdminNavbar onNavItemClick={handleNavItemClick} />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AdminAppShellLayout;
