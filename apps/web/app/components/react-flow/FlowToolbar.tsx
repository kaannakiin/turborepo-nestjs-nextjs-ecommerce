import { Button, Group, Paper, Tooltip } from "@mantine/core";
import { IconFilter, IconGitMerge, IconFlag } from "@tabler/icons-react";
import { Panel } from "@xyflow/react";

interface FlowToolbarProps {
  onAddCondition: () => void;
  onAddGroup: () => void;
  onAddResult: () => void;
}

export const FlowToolbar = ({
  onAddCondition,
  onAddGroup,
  onAddResult,
}: FlowToolbarProps) => {
  return (
    <Panel position="top-center" style={{ margin: 16 }}>
      <Paper shadow="sm" radius="md" p={4} withBorder>
        <Group gap={4}>
          <Tooltip label="Tekil Koşul Ekle" withArrow position="bottom">
            <Button
              variant="light"
              color="blue"
              size="xs"
              leftSection={<IconFilter size={16} />}
              onClick={onAddCondition}
            >
              Koşul
            </Button>
          </Tooltip>

          <Tooltip
            label="Grup Koşul (VE/VEYA) Ekle"
            withArrow
            position="bottom"
          >
            <Button
              variant="light"
              color="violet"
              size="xs"
              leftSection={<IconGitMerge size={16} />}
              onClick={onAddGroup}
            >
              Grup
            </Button>
          </Tooltip>

          <Tooltip label="Sonuç/Segment Ekle" withArrow position="bottom">
            <Button
              variant="light"
              color="cyan"
              size="xs"
              leftSection={<IconFlag size={16} />}
              onClick={onAddResult}
            >
              Sonuç
            </Button>
          </Tooltip>
        </Group>
      </Paper>
    </Panel>
  );
};
