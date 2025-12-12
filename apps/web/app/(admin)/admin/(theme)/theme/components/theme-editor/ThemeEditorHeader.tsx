"use client";

import { ActionIcon, Burger, Button, Group, Tooltip } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import { ThemeIconsType } from "../../page";
import { useTheme } from "@/context/theme-context/ThemeContext";

interface AppShellHeaderProps {
  opened: boolean;
  toggle: UseDisclosureHandlers["toggle"];
  themeIcons: Array<ThemeIconsType>;
}

const ThemeEditorHeader = ({
  opened,
  toggle,
  themeIcons,
}: AppShellHeaderProps) => {
  const { media, changeMedia } = useTheme();
  return (
    <Group h="100%" px="md" align="center" justify="space-between">
      <Group h="100%" align="center">
        <Burger opened={opened} onClick={toggle} size="sm" />
      </Group>
      <Group
        gap={"xs"}
        align="center"
        visibleFrom="sm"
        className="border-2 p-1 border-(--mantine-primary-color-5) rounded-md overflow-hidden "
      >
        {themeIcons.map((themeIcon) => (
          <ActionIcon
            key={themeIcon.key}
            size={"lg"}
            color="admin"
            variant={media === themeIcon.key ? "filled" : "transparent"}
            onClick={() => {
              changeMedia(themeIcon.key);
            }}
          >
            <Tooltip label={themeIcon.label} position="bottom" withArrow>
              {themeIcon.icon}
            </Tooltip>
          </ActionIcon>
        ))}
      </Group>
      <Group visibleFrom="sm" gap={"md"} align="center">
        <Button variant="outline">Vazgeç</Button>
        <Button variant="filled">Kaydet</Button>
      </Group>
    </Group>
  );
};

export default ThemeEditorHeader;
