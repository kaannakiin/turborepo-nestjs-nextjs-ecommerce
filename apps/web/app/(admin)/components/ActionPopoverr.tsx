"use client";

import {
  ActionIcon,
  ActionIconProps,
  Button,
  Group,
  Popover,
  Stack,
  Text,
} from "@mantine/core";
import { MantineSize } from "@repo/types";
import { useState } from "react";

interface ActionPopoverrProps {
  targetIcon: React.ReactNode;
  text: string;
  onConfirm?: () => void | Promise<void>;
  size?: MantineSize;
  className?: string;
  variant?: ActionIconProps["variant"];
}

const ActionPopover = ({
  targetIcon,
  text,
  onConfirm,
  size = "xs",
  className,
  variant = "transparent",
}: ActionPopoverrProps) => {
  const [opened, setOpened] = useState(false);
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    setOpened(false);
  };
  return (
    <Popover opened={opened} onChange={setOpened}>
      <Popover.Target>
        <ActionIcon
          className={className}
          variant={variant}
          c={"red"}
          size={size}
          onClick={() => setOpened((o) => !o)}
        >
          {targetIcon}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown bg={"gray.3"} maw={300}>
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
            <Button size="xs" color={"red"} onClick={handleConfirm}>
              Onayla
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default ActionPopover;
