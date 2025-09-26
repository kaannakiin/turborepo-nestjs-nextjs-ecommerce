"use client";

import { ActionIcon, Button, Group, Popover, Stack, Text } from "@mantine/core";
import { useState } from "react";

interface ActionPopoverrProps {
  targetIcon: React.ReactNode;
  text: string;
  onConfirm?: () => void;
}

const ActionPopover = ({
  targetIcon,
  text,
  onConfirm,
}: ActionPopoverrProps) => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onChange={setOpened}>
      <Popover.Target>
        <ActionIcon
          variant="transparent"
          c={"red"}
          size={"xs"}
          onClick={() => setOpened((o) => !o)}
        >
          {targetIcon}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown bg={"gray.3"}>
        <Stack gap={"xs"}>
          <Text fz={"md"}>{text}</Text>
          <Group justify="end" gap="xs">
            <Button
              variant="default"
              size="xs"
              onClick={() => setOpened(false)}
            >
              İptal
            </Button>
            <Button size="xs" color={"red"} onClick={onConfirm}>
              Onayla
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default ActionPopover;
