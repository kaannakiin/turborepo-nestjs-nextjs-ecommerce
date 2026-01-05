"use client";

import { signOutClient } from "@lib/auth/signout-client";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { openSpotlight } from "@mantine/spotlight";
import { TokenPayload } from "@repo/types";
import {
  IconCommand,
  IconLayoutSidebarLeftExpandFilled,
  IconLayoutSidebarRightExpandFilled,
  IconLogout,
  IconSearch,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { findActiveNav, navGroups } from "./data";

interface AdminNavbarProps {
  session: TokenPayload;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavItemClick?: () => void;
}

const AdminNavbar = ({
  session,
  collapsed,
  onToggleCollapse,
  onNavItemClick,
}: AdminNavbarProps) => {
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [activeHref, setActiveHref] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  useHotkeys([["mod+K", () => openSpotlight()]]);

  useEffect(() => {
    const { groupIndex, href } = findActiveNav(pathname);
    setActiveGroup(groupIndex);
    setActiveHref(href);
  }, [pathname]);

  const handleGroupClick = (index: number) => {
    setActiveGroup(index);
  };

  const handleSubItemClick = (href: string) => {
    router.push(`/admin${href}`);
    onNavItemClick?.();
  };

  const currentGroupItems =
    navGroups[activeGroup]?.sub.filter((item) => !item.hidden) || [];

  if (collapsed) {
    return (
      <Box className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
        <AppShell.Section className="p-2 flex justify-center border-b border-slate-100">
          <Tooltip label="Menüyü Genişlet" position="right" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xl"
              radius="xl"
              onClick={onToggleCollapse}
              className="hover:bg-slate-100 transition-all duration-200"
            >
              <IconLayoutSidebarLeftExpandFilled stroke={2} />
            </ActionIcon>
          </Tooltip>
        </AppShell.Section>

        <AppShell.Section className="py-4 flex justify-center border-b border-slate-100">
          <Tooltip label={session.name} position="right" withArrow>
            <Avatar
              src={session.image}
              size="md"
              radius="xl"
              color="admin"
              className="ring-2 ring-white shadow-md cursor-pointer hover:ring-[var(--mantine-primary-color-2)] transition-all duration-200"
            >
              {session.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        </AppShell.Section>

        <AppShell.Section className="py-3 flex justify-center border-b border-slate-100">
          <Tooltip label="Ara (⌘K)" position="right" withArrow>
            <ActionIcon
              variant="light"
              color="admin"
              size="lg"
              radius="xl"
              onClick={openSpotlight}
              className="hover:scale-105 transition-all duration-200"
            >
              <IconSearch stroke={2} />
            </ActionIcon>
          </Tooltip>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} className="py-3">
          <Stack align="center" gap="xs">
            {navGroups.map((item, index) => (
              <Tooltip
                key={index}
                label={item.label}
                position="right"
                withArrow
                offset={12}
              >
                <ActionIcon
                  variant={activeGroup === index ? "filled" : "subtle"}
                  color={activeGroup === index ? "admin" : "gray"}
                  size="lg"
                  radius="xl"
                  onClick={() => handleGroupClick(index)}
                  className={`transition-all duration-200 ${
                    activeGroup === index
                      ? "shadow-md hover:shadow-lg"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                </ActionIcon>
              </Tooltip>
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section className="py-3 flex justify-center border-t border-slate-100">
          <Tooltip label="Çıkış Yap" position="right" withArrow>
            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              radius="xl"
              className="hover:bg-red-50 transition-all duration-200"
            >
              <IconLogout size={18} stroke={2} />
            </ActionIcon>
          </Tooltip>
        </AppShell.Section>
      </Box>
    );
  }

  return (
    <Box className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <AppShell.Section className="p-4 border-b border-slate-100">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <Avatar
              src={session.image}
              size={44}
              radius="xl"
              color="admin"
              className="ring-2 ring-white shadow-lg"
            >
              {session.name?.charAt(0).toUpperCase()}
            </Avatar>
            <div className="flex flex-col">
              <Text size="sm" fw={600} className="text-slate-800 leading-tight">
                {session.name}
              </Text>
              <Text size="xs" c="dimmed" className="leading-tight mt-0.5">
                {session.email || session.phone || "Admin"}
              </Text>
              <Text
                size="xs"
                className="text-[var(--mantine-primary-color-7)] font-medium mt-1 bg-[var(--mantine-primary-color-0)] px-2 py-0.5 rounded-full w-fit"
              >
                {session.role}
              </Text>
            </div>
          </Group>
          <Tooltip label="Menüyü Daralt" position="left" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              radius="xl"
              onClick={onToggleCollapse}
              className="hover:bg-slate-100 transition-all duration-200"
            >
              <IconLayoutSidebarRightExpandFilled stroke={2} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </AppShell.Section>

      <AppShell.Section className="px-4 py-3">
        <UnstyledButton
          onClick={openSpotlight}
          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[var(--mantine-primary-color-3)] hover:bg-[var(--mantine-primary-color-0)]/50 transition-all duration-200 group shadow-sm"
        >
          <Group justify="space-between">
            <Group gap="xs">
              <IconSearch
                size={16}
                stroke={2}
                className="text-slate-400 group-hover:text-[var(--mantine-primary-color-5)] transition-colors"
              />
              <Text
                size="sm"
                c="dimmed"
                className="group-hover:text-[var(--mantine-primary-color-7)] transition-colors"
              >
                Hızlı arama...
              </Text>
            </Group>
            <Group gap={4}>
              <Box className="px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-[var(--mantine-primary-color-1)] transition-colors">
                <IconCommand
                  size={12}
                  className="text-slate-500 group-hover:text-[var(--mantine-primary-color-7)]"
                />
              </Box>
              <Box className="px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-[var(--mantine-primary-color-1)] transition-colors">
                <Text
                  size="xs"
                  fw={500}
                  className="text-slate-500 group-hover:text-[var(--mantine-primary-color-7)]"
                >
                  K
                </Text>
              </Box>
            </Group>
          </Group>
        </UnstyledButton>
      </AppShell.Section>

      <Divider color="gray.1" />

      <AppShell.Section grow component={ScrollArea} className="px-3 py-3">
        <div className="flex gap-1 h-full">
          <Stack gap="xs" className="py-1">
            {navGroups.map((item, index) => (
              <Tooltip
                key={index}
                label={item.label}
                position="right"
                withArrow
                offset={8}
              >
                <ActionIcon
                  variant={activeGroup === index ? "filled" : "subtle"}
                  color={activeGroup === index ? "admin" : "gray"}
                  size="lg"
                  radius="lg"
                  onClick={() => handleGroupClick(index)}
                  className={`transition-all duration-200 ${
                    activeGroup === index
                      ? "shadow-md hover:shadow-lg hover:scale-105"
                      : "hover:bg-slate-100 hover:scale-105"
                  }`}
                >
                  {item.icon}
                </ActionIcon>
              </Tooltip>
            ))}
          </Stack>

          <Box className="flex-1">
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              className="px-2 mb-2 uppercase tracking-wider"
            >
              {navGroups[activeGroup]?.label}
            </Text>
            <Stack gap={4}>
              {currentGroupItems.map((subItem, subIndex) => (
                <UnstyledButton
                  key={subIndex}
                  onClick={() => handleSubItemClick(subItem.href)}
                  className={`w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeHref === subItem.href
                      ? "bg-[var(--mantine-primary-color-5)] text-white shadow-md hover:bg-[var(--mantine-primary-color-7)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-0.5"
                  }`}
                >
                  <Tooltip
                    label={subItem.tooltip}
                    disabled={!subItem.tooltip}
                    withArrow
                    position="right"
                    w={250}
                    multiline
                  >
                    <Text
                      size="sm"
                      fw={activeHref === subItem.href ? 600 : 500}
                      className="transition-all duration-200"
                    >
                      {subItem.label}
                    </Text>
                  </Tooltip>
                </UnstyledButton>
              ))}
            </Stack>
          </Box>
        </div>
      </AppShell.Section>

      <AppShell.Section className="p-3 border-t border-slate-100">
        <UnstyledButton
          onClick={async (e) => {
            e.preventDefault();
            await signOutClient();
          }}
          className="w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 group"
        >
          <Group gap="sm">
            <IconLogout
              size={18}
              stroke={2}
              className="group-hover:translate-x-0.5 transition-transform"
            />
            <Text size="sm" fw={500}>
              Çıkış Yap
            </Text>
          </Group>
        </UnstyledButton>
      </AppShell.Section>
    </Box>
  );
};

export default AdminNavbar;
