import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Paper,
  Tooltip,
} from "@mantine/core";
import {
  IconCopy,
  IconFilter,
  IconFlag,
  IconGitMerge,
  IconMaximize,
  IconTrash,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { Panel, useReactFlow, useStore } from "@xyflow/react";
import { Activity } from "react";

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
  const {
    deleteElements,
    fitView,
    zoomIn,
    zoomOut,
    getNodes,
    getEdges,
    setNodes,
    setEdges,
  } = useReactFlow();

  const selectedNodes = useStore((state) =>
    Array.from(state.nodeLookup.values()).filter((node) => node.selected)
  );

  const selectedEdges = useStore((state) =>
    Array.from(state.edgeLookup.values()).filter((edge) => edge.selected)
  );

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
  const canDelete = selectedNodes.every((node) => node.deletable !== false);

  const handleDelete = () => {
    if (!canDelete) return;
    deleteElements({
      nodes: selectedNodes,
      edges: selectedEdges,
    });
  };

  const handleDuplicate = () => {
    const newNodes = selectedNodes.map((node) => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }));

    setNodes([...getNodes(), ...newNodes]);
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

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

          <Divider orientation="vertical" />

          <Tooltip label="Zoom In" withArrow position="bottom">
            <ActionIcon
              variant="light"
              color="gray"
              size="md"
              onClick={() => zoomIn({ duration: 300 })}
            >
              <IconZoomIn size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Zoom Out" withArrow position="bottom">
            <ActionIcon
              variant="light"
              color="gray"
              size="md"
              onClick={() => zoomOut({ duration: 300 })}
            >
              <IconZoomOut size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Tümünü Göster" withArrow position="bottom">
            <ActionIcon
              variant="light"
              color="gray"
              size="md"
              onClick={handleFitView}
            >
              <IconMaximize size={16} />
            </ActionIcon>
          </Tooltip>

          <Activity mode={hasSelection ? "visible" : "hidden"}>
            <Divider orientation="vertical" />

            <Tooltip label="Kopyala" withArrow position="bottom">
              <ActionIcon
                variant="light"
                color="teal"
                size="md"
                onClick={handleDuplicate}
              >
                <IconCopy size={16} />
              </ActionIcon>
            </Tooltip>

            <Activity mode={canDelete ? "visible" : "hidden"}>
              <Tooltip label={"Seçili öğeleri sil"} withArrow position="bottom">
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDelete}
                  disabled={!canDelete}
                >
                  Sil ({selectedNodes.length + selectedEdges.length})
                </Button>
              </Tooltip>
            </Activity>
          </Activity>
        </Group>
      </Paper>
    </Panel>
  );
};
