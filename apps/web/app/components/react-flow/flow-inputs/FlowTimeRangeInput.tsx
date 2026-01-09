import { ActionIcon, Group, Text, rem } from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconClock } from "@tabler/icons-react";
import React, { useRef } from "react";

interface FlowTimeRangeInputProps {
  value: { from: string; to: string };
  onChange: (value: unknown) => void;
  label: string;
}

const FlowTimeRangeInput = ({
  value,
  onChange,
  label,
}: FlowTimeRangeInputProps) => {
  const safeValue = value || { from: "09:00", to: "18:00" };
  const refFrom = useRef<HTMLInputElement>(null);
  const refTo = useRef<HTMLInputElement>(null);

  const pickerControl = (ref: React.RefObject<HTMLInputElement>) => (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => ref.current?.showPicker()}
    >
      <IconClock style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
    </ActionIcon>
  );

  return (
    <div>
      <Text size="xs" fw={500} mb={3}>
        {label}
      </Text>
      <Group gap="xs" grow align="flex-start">
        <TimeInput
          size="xs"
          label="Başlangıç"
          ref={refFrom}
          rightSection={pickerControl(refFrom)}
          value={safeValue.from}
          onChange={(e) =>
            onChange({ ...safeValue, from: e.currentTarget.value })
          }
        />
        <TimeInput
          size="xs"
          label="Bitiş"
          ref={refTo}
          rightSection={pickerControl(refTo)}
          value={safeValue.to}
          onChange={(e) =>
            onChange({ ...safeValue, to: e.currentTarget.value })
          }
        />
      </Group>
    </div>
  );
};

export default FlowTimeRangeInput;
