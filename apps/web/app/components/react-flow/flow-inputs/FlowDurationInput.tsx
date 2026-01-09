import { Group, NumberInput, Select, Text } from "@mantine/core";
import React from "react";

const UNIT_OPTIONS = [
  { value: "MINUTES", label: "Dakika" },
  { value: "HOURS", label: "Saat" },
  { value: "DAYS", label: "Gün" },
  { value: "WEEKS", label: "Hafta" },
  { value: "MONTHS", label: "Ay" },
];

interface FlowDurationInputProps {
  value: { amount: number; unit: string };
  onChange: (value: unknown) => void;
  label: string;
}

const FlowDurationInput = ({
  value,
  onChange,
  label,
}: FlowDurationInputProps) => {
  const safeValue = value || { amount: 1, unit: "DAYS" };

  const handleAmountChange = (val: number | string) => {
    onChange({ ...safeValue, amount: Number(val) || 0 });
  };

  const handleUnitChange = (val: string | null) => {
    if (val) {
      onChange({ ...safeValue, unit: val });
    }
  };

  return (
    <div>
      <Text size="xs" fw={500} mb={3}>
        {label}
      </Text>
      <Group gap="xs" grow>
        <NumberInput
          value={safeValue.amount}
          onChange={handleAmountChange}
          min={1}
          size="xs"
          placeholder="Miktar"
          allowNegative={false}
        />
        <Select
          value={safeValue.unit}
          onChange={handleUnitChange}
          data={UNIT_OPTIONS}
          size="xs"
          allowDeselect={false}
        />
      </Group>
    </div>
  );
};

export default FlowDurationInput;
