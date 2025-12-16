"use client";

import { useTheme } from "@/context/theme-context/ThemeContext";
import { ActionIcon, Burger, Button, Group, Tooltip } from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import { SubmitHandler, UseFormHandleSubmit } from "@repo/shared";
import { ThemeInputType } from "@repo/types";
import { ThemeIconsType } from "../../page";

interface AppShellHeaderProps {
  opened: boolean;
  toggle: UseDisclosureHandlers["toggle"];
  themeIcons: Array<ThemeIconsType>;
  onSubmit: SubmitHandler<ThemeInputType>;
  handleSubmit: UseFormHandleSubmit<ThemeInputType>;
}

const ThemeEditorHeader = ({
  opened,
  toggle,
  themeIcons,
  onSubmit,
  handleSubmit,
}: AppShellHeaderProps) => {
  const { actualMedia: media, changeActualMedia: changeMedia } = useTheme();
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
        <Button variant="filled" type="button" onClick={handleSubmit(onSubmit)}>
          Kaydet
        </Button>
      </Group>
    </Group>
  );
};

export default ThemeEditorHeader;
