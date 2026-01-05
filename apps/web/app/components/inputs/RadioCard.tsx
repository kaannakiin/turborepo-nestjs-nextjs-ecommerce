import { Group, Radio, RadioIndicatorProps, Text } from "@mantine/core";
import React from "react";
import classes from "./modules/RadioCard.module.css";

interface RadioCardProps {
  radioProps?: RadioIndicatorProps;
  description?: React.ReactNode | string;
  label: React.ReactNode | string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const RadioCard = ({
  radioProps,
  label,
  description,
  value,
  checked,
  onChange,
}: RadioCardProps) => {
  return (
    <Radio.Card
      className={classes.root}
      radius="md"
      checked={checked}
      onClick={() => onChange(value)}
    >
      <Group wrap="nowrap" align="flex-start">
        <Radio.Indicator {...radioProps} />
        <div>
          <Text className={classes.label}>{label}</Text>
          {description && (
            <Text className={classes.description}>{description}</Text>
          )}
        </div>
      </Group>
    </Radio.Card>
  );
};

export default RadioCard;
