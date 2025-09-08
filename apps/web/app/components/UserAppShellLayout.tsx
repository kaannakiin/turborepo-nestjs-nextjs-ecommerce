"use client";
import { AppShell, Burger, Drawer, Group } from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
const UserAppShellLayout = ({ children }: { children: React.ReactNode }) => {
  const pinned = useHeadroom({ fixedAt: 160 });
  const [opened, { open, close }] = useDisclosure();
  return (
    <AppShell header={{ height: 64, collapsed: !pinned }}>
      <AppShell.Header className="h-16">
        <Group
          className="w-full h-16 max-w-[1500px] lg:mx-auto bg-amber-100"
          justify="space-between"
          align="center"
        >
          <Group align="center"></Group>
          <Group align="center" gap={"lg"}>
            <Burger opened={opened} onClick={open} hiddenFrom="sm" size="md" />
          </Group>
        </Group>
      </AppShell.Header>
      <Drawer.Root opened={opened} onClose={close} position="right" size={"xs"}>
        <Drawer.Overlay backgroundOpacity={0.5} blur={4} />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Drawer title</Drawer.Title>
            <Drawer.CloseButton size={"lg"} fw={700} />
          </Drawer.Header>
          <Drawer.Body>Drawer content</Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
      <AppShell.Main pt="64px">{children}</AppShell.Main>
    </AppShell>
  );
};

export default UserAppShellLayout;
