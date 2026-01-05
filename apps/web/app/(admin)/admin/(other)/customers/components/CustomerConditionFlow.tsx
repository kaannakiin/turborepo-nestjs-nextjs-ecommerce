import { Button, Drawer, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo } from "react";

import { LogicalOperator } from "@repo/database/client";
import {
  createConditionGroupNode,
  createConditionNode,
  createResultNode,
  DecisionTreeSchema,
  SegmentCondition,
  type DecisionTree,
} from "@repo/types";

import ConditionGroupNode, {
  ConditionGroupNodeType,
} from "@/components/react-flow/ConditionGroupNode";
import ConditionNode, {
  ConditionNodeType,
} from "@/components/react-flow/ConditionNode";
import { FlowToolbar } from "@/components/react-flow/FlowToolbar";
import ResultNode, { ResultNodeType } from "@/components/react-flow/ResultNode";
import StartNode, { StartNodeType } from "@/components/react-flow/StartNode";

const nodeTypes = {
  start: StartNode,
  condition: ConditionNode,
  conditionGroup: ConditionGroupNode,
  result: ResultNode,
};

type FlowNode =
  | StartNodeType
  | ConditionNodeType
  | ConditionGroupNodeType
  | ResultNodeType;

const getNodeLabel = (node: FlowNode): string => {
  if (node.type === "start") {
    return (node as StartNodeType).data.label;
  }
  if (node.type === "result") {
    return (node as ResultNodeType).data.label;
  }
  if (node.type === "condition") {
    return (node as ConditionNodeType).data.condition.field;
  }
  if (node.type === "conditionGroup") {
    return "Koşul Grubu";
  }
  return "Bilinmeyen Node";
};

const validateFlowTopology = (nodes: FlowNode[], edges: Edge[]) => {
  const errors: string[] = [];

  const startNode = nodes.find((n) => n.type === "start");
  if (!startNode) errors.push("Başlangıç düğümü eksik.");

  const resultNodes = nodes.filter((n) => n.type === "result");
  if (resultNodes.length === 0)
    errors.push("En az bir Sonuç düğümü eklemelisiniz.");

  nodes.forEach((node) => {
    if (node.type !== "start") {
      const hasIncoming = edges.some((e) => e.target === node.id);
      if (!hasIncoming) {
        const label = getNodeLabel(node);
        errors.push(`"${label}" düğümünün girişi bağlı değil.`);
      }
    }

    if (node.type !== "result") {
      if (node.type === "condition" || node.type === "conditionGroup") {
        const hasYes = edges.some(
          (e) => e.source === node.id && e.sourceHandle === "yes"
        );

        if (!hasYes) {
          const label = getNodeLabel(node);
          errors.push(`"${label}" için 'EVET' yolu seçilmedi.`);
        }
      } else if (node.type === "start") {
        const hasOutgoing = edges.some((e) => e.source === node.id);
        if (!hasOutgoing)
          errors.push("Başlangıç düğümü hiçbir yere bağlanmamış.");
      }
    }
  });

  return errors;
};

const initialNodes: FlowNode[] = [
  {
    id: "start",
    type: "start",
    position: { x: 250, y: 50 },
    data: { label: "Müşteri Oluşturuldu" },
  },
];
const initialEdges: Edge[] = [];

interface CustomerConditionFlowProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: DecisionTree) => void;
  name: string;
  initialData?: DecisionTree;
}

const CustomerConditionFlow = ({
  onClose,
  opened,
  onSubmit,
  name,
  initialData,
}: CustomerConditionFlowProps) => {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<FlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes as FlowNode[]);
      setEdges(initialData.edges);
    }
  }, [initialData, setNodes, setEdges]);

  const handleSubmit = () => {
    const topologyErrors = validateFlowTopology(nodes, edges);
    if (topologyErrors.length > 0) {
      topologyErrors.forEach((msg) => {
        notifications.show({
          message: msg,
          color: "red",
          title: "Akış Hatası",
        });
      });
      return;
    }

    const payload = { nodes, edges };
    const parsed = DecisionTreeSchema.safeParse(payload);

    if (!parsed.success) {
      console.error(parsed.error);
      notifications.show({
        message: "Veri yapısında hata var. Lütfen tekrar kontrol edin.",
        color: "red",
        title: "Doğrulama Hatası",
      });
      return;
    }

    onSubmit(parsed.data);
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source === params.target) return;
      setEdges((eds) => {
        let newEdges = eds.filter(
          (e) =>
            !(
              e.source === params.source &&
              e.sourceHandle === params.sourceHandle
            )
        );

        newEdges = newEdges.filter((e) => e.target !== params.target);

        return addEdge(params, newEdges);
      });
    },
    [setEdges]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const handleConditionUpdate = useCallback(
    (nodeId: string, condition: SegmentCondition) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId && n.type === "condition") {
            return {
              ...n,
              data: { ...n.data, condition },
            } as ConditionNodeType;
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  const handleConditionGroupUpdate = useCallback(
    (
      nodeId: string,
      data: { operator: LogicalOperator; conditions: SegmentCondition[] }
    ) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId && n.type === "conditionGroup") {
            return {
              ...n,
              data: { ...n.data, ...data },
            } as ConditionGroupNodeType;
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  const getNewNodePosition = () => ({
    x: 250 + Math.random() * 50,
    y: 200 + Math.random() * 50,
  });

  const addConditionNode = useCallback(() => {
    const newNode = createConditionNode(
      "ORDER_COUNT",
      getNewNodePosition()
    ) as ConditionNodeType;
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const addGroupNode = useCallback(() => {
    const newNode = createConditionGroupNode(
      LogicalOperator.AND,
      [],
      getNewNodePosition()
    ) as ConditionGroupNodeType;
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const addResultNode = useCallback(() => {
    const newNode = createResultNode(
      name || "Yeni Segment",
      getNewNodePosition(),
      "cyan"
    ) as ResultNodeType;
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, name]);

  const nodesWithHandlers = useMemo(() => {
    return nodes.map((node) => {
      const commonProps = { onDelete: () => handleDeleteNode(node.id) };

      if (node.type === "condition") {
        return {
          ...node,
          data: {
            ...node.data,
            ...commonProps,
            onUpdate: (c: SegmentCondition) =>
              handleConditionUpdate(node.id, c),
          },
        } as ConditionNodeType;
      }
      if (node.type === "conditionGroup") {
        return {
          ...node,
          data: {
            ...node.data,
            ...commonProps,

            onUpdate: (d: {
              operator: LogicalOperator;
              conditions: SegmentCondition[];
            }) => handleConditionGroupUpdate(node.id, d),
          },
        } as ConditionGroupNodeType;
      }
      if (node.type === "result") {
        return {
          ...node,
          data: { ...node.data, ...commonProps },
        } as ResultNodeType;
      }
      return node;
    });
  }, [
    nodes,
    handleConditionUpdate,
    handleConditionGroupUpdate,
    handleDeleteNode,
  ]);

  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="100%"
      styles={{ body: { padding: 0 } }}
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header>
          <Group className="w-full" justify="space-between">
            <span className="font-semibold text-lg">
              Müşteri Otomasyon Akışı
            </span>
            <Group>
              <Button variant="default" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>Kaydet</Button>
            </Group>
          </Group>
        </Drawer.Header>
        <Drawer.Body>
          <ReactFlowProvider>
            <div style={{ width: "100%", height: "calc(100vh - 60px)" }}>
              <ReactFlow
                nodes={nodesWithHandlers}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{
                  type: "smoothstep",
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: "#555",
                  },
                  style: {
                    strokeWidth: 2,
                    stroke: "#555",
                  },
                }}
                isValidConnection={(connection) =>
                  connection.source !== connection.target
                }
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                />
                <Controls />
                <FlowToolbar
                  onAddCondition={addConditionNode}
                  onAddGroup={addGroupNode}
                  onAddResult={addResultNode}
                />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default CustomerConditionFlow;
