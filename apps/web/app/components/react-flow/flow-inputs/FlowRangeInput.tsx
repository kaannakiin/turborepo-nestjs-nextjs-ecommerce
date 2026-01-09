import { Group, NumberInput } from "@mantine/core";

type RangeValue = { min: number; max: number };

type FlowRangeInputProps = {
  value: RangeValue | null;
  onChange: (value: RangeValue) => void;
  label?: string;
  min?: number;
  max?: number;
};

const FlowRangeInput = ({
  value,
  onChange,
  label,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
}: FlowRangeInputProps) => {
  const currentValue: RangeValue = value ?? { min: 0, max: 100 };

  return (
    <Group gap="xs" grow>
      <NumberInput
        size="xs"
        label={label ? `${label} (Min)` : "Min"}
        placeholder="Min"
        value={currentValue.min}
        onChange={(val) =>
          onChange({
            ...currentValue,
            min: typeof val === "number" ? val : 0,
          })
        }
        min={min}
        max={currentValue.max}
        hideControls
      />

      <NumberInput
        size="xs"
        label={label ? `${label} (Max)` : "Max"}
        placeholder="Max"
        value={currentValue.max}
        onChange={(val) =>
          onChange({
            ...currentValue,
            max: typeof val === "number" ? val : 100,
          })
        }
        min={currentValue.min}
        max={max}
        hideControls
      />
    </Group>
  );
};

export default FlowRangeInput;
