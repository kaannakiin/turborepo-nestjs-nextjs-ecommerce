"use client";
import { AppShell } from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";
const UserAppShellLayout = ({ children }: { children: React.ReactNode }) => {
  const pinned = useHeadroom({ fixedAt: 160 });
  return (
    <AppShell
      header={{ height: 80, collapsed: !pinned, offset: false }}
      padding="md"
    >
      <AppShell.Header p="md"></AppShell.Header>

      <AppShell.Main pt="80px">{children}</AppShell.Main>
    </AppShell>
  );
};

export default UserAppShellLayout;
