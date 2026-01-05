import { Group, Tooltip, Text, Center } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => (
  <Group gap={5} align="center">
    <Text span size="sm" fw={500}>
      {label}
    </Text>
    <Tooltip
      label={tooltip}
      multiline
      w={220}
      withArrow
      transitionProps={{ duration: 200 }}
      events={{ hover: true, focus: true, touch: true }}
    >
      <Center style={{ cursor: "help" }}>
        <IconInfoCircle
          size={16}
          className="text-gray-400 hover:text-blue-500"
        />
      </Center>
    </Tooltip>
  </Group>
);

export default LabelWithTooltip;
