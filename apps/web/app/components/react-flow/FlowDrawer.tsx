'use client';

import { Button, Drawer, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createId } from '@repo/shared';
import { getDomain } from '@repo/types';
import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Node,
  NodeProps,
  NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo } from 'react';
import { FlowToolbar } from './FlowToolbar';
import { StartNodeData } from './StartNode';
import { validateFlowTopology } from './validator';

export interface ConditionNodeData<TCondition> extends Record<string, unknown> {
  condition: TCondition;
  onUpdate: (condition: TCondition) => void;
  onDelete: () => void;
}

export interface GroupNodeData<TCondition> extends Record<string, unknown> {
  operator: 'AND' | 'OR';
  conditions: TCondition[];
  onUpdate: (data: {
    operator: 'AND' | 'OR';
    conditions: TCondition[];
  }) => void;
  onDelete: () => void;
}

export interface ResultNodeData extends Record<string, unknown> {
  label: string;
  actions: unknown[];
  onDelete: () => void;
}

type AppNodeData<
  TCondition,
  TResultData extends Record<string, unknown> = ResultNodeData,
> =
  | ConditionNodeData<TCondition>
  | GroupNodeData<TCondition>
  | TResultData
  | StartNodeData;

type AppNode<
  TCondition,
  TResultData extends Record<string, unknown> = ResultNodeData,
> = Node<AppNodeData<TCondition, TResultData>>;

type CustomNodeComponent<TData extends Record<string, unknown>> =
  React.ComponentType<NodeProps<Node<TData>>>;

interface GenericFlowDrawerProps<
  TField extends string,
  TCondition,
  TResultData extends Record<string, unknown> = ResultNodeData,
> {
  opened: boolean;
  onClose: () => void;
  onSave: (data: { nodes: Node[]; edges: Edge[] }) => void;
  initialData?: { nodes: Node[]; edges: Edge[] } | null;
  domainName: string;
  defaultField: TField;
  getNodeLabel: (node: Node) => string;
  nodeComponents: {
    start: CustomNodeComponent<StartNodeData>;
    condition: CustomNodeComponent<ConditionNodeData<TCondition>>;
    conditionGroup?: CustomNodeComponent<GroupNodeData<TCondition>>;
    result: CustomNodeComponent<TResultData>;
  };
}

export const FlowDrawer = <
  TField extends string,
  TCondition,
  TResultData extends Record<string, unknown> = ResultNodeData,
>({
  opened,
  onClose,
  onSave,
  initialData,
  domainName,
  defaultField,
  nodeComponents,
  getNodeLabel,
}: GenericFlowDrawerProps<TField, TCondition, TResultData>) => {
  const createStartNode = useCallback(
    (): AppNode<TCondition, TResultData> => ({
      id: 'start-node',
      type: 'start',
      position: { x: 250, y: 50 },
      data: {
        label: 'Başlangıç',
        description: 'Karar mekanizması buradan başlar',
        color: 'blue',
      },
      deletable: false,
    }),
    [],
  );

  const initialNodesState = useMemo<AppNode<TCondition, TResultData>[]>(() => {
    if (initialData?.nodes && initialData.nodes.length > 0) {
      return (initialData.nodes as AppNode<TCondition, TResultData>[]).map(
        (n) => (n.type === 'start' ? { ...n, deletable: false } : n),
      );
    }
    return [createStartNode()];
  }, [initialData, createStartNode]);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<AppNode<TCondition, TResultData>>(initialNodesState);

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.edges || [],
  );

  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([createStartNode()]);
    }
  }, [nodes.length, setNodes, createStartNode]);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      start: nodeComponents.start,
      condition: nodeComponents.condition,
      conditionGroup: nodeComponents.conditionGroup,
      result: nodeComponents.result,
    }),
    [nodeComponents],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'smoothstep', animated: true }, eds),
      ),
    [setEdges],
  );

  const updateNodeData = useCallback(
    (id: string, newData: Partial<AppNodeData<TCondition, TResultData>>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, ...newData } as AppNodeData<
                TCondition,
                TResultData
              >,
            };
          }
          return node;
        }),
      );
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => {
        const nodeToDelete = nds.find((n) => n.id === id);
        if (nodeToDelete?.type === 'start') {
          return nds;
        }
        return nds.filter((n) => n.id !== id);
      });
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges],
  );

  const addNode = (type: 'condition' | 'conditionGroup' | 'result') => {
    const id = createId();

    let data: AppNodeData<TCondition, TResultData>;

    if (type === 'condition') {
      const domainConfig = getDomain<TField, TCondition>(domainName);

      if (!domainConfig) {
        console.error(`Domain config '${domainName}' not found!`);
        return;
      }

      const emptyCondition = domainConfig.createEmptyCondition(defaultField);

      data = {
        condition: emptyCondition,
        onUpdate: (newCondition) =>
          updateNodeData(id, { condition: newCondition }),
        onDelete: () => deleteNode(id),
      };
    } else if (type === 'conditionGroup') {
      data = {
        operator: 'AND',
        conditions: [],
        onUpdate: (newData) => updateNodeData(id, newData),
        onDelete: () => deleteNode(id),
      };
    } else {
      data = {
        label: 'Yeni Sonuç',
        actions: [],
        onDelete: () => deleteNode(id),
      } as unknown as TResultData;
    }

    const newNode: AppNode<TCondition, TResultData> = {
      id,
      type,
      position: { x: 250, y: Math.random() * 400 },
      data,
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = () => {
    const topologyErrors = validateFlowTopology(nodes, edges, {
      startNodeType: 'start',
      resultNodeType: 'result',
      conditionNodeTypes: ['condition', 'conditionGroup'],
      getNodeLabel: getNodeLabel,
    });

    if (topologyErrors.length > 0) {
      topologyErrors.forEach((msg) => {
        notifications.show({
          message: msg,
          color: 'red',
          title: 'Akış Hatası',
        });
      });
      return;
    }

    const cleanedNodes = nodes.map((node) => {
      const cleanedData = { ...node.data };

      delete (cleanedData as Record<string, unknown>).onUpdate;
      delete (cleanedData as Record<string, unknown>).onDelete;

      return {
        ...node,
        data: cleanedData,
      };
    });

    onSave({ nodes: cleanedNodes, edges });
  };

  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="100%"
      classNames={{
        header: 'border-b border-gray-400',
      }}
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header>
          <Group className="w-full" justify="space-between">
            <span className="font-semibold text-lg">Karar Ağacı Editörü</span>
            <Group>
              <Button variant="default" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={handleSave}>Kaydet</Button>
            </Group>
          </Group>
        </Drawer.Header>
        <Drawer.Body>
          <ReactFlowProvider>
            <div style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: '#555',
                  },
                  style: {
                    strokeWidth: 2,
                    stroke: '#555',
                  },
                }}
                isValidConnection={(connection) => {
                  if (connection.source === connection.target) return false;

                  const isAlreadyConnected = edges.some(
                    (edge) =>
                      edge.source === connection.source &&
                      edge.target === connection.target,
                  );

                  if (isAlreadyConnected) {
                    return false;
                  }

                  const isSourceHandleOccupied = edges.some(
                    (edge) =>
                      edge.source === connection.source &&
                      edge.sourceHandle === connection.sourceHandle,
                  );
                  if (isSourceHandleOccupied) return false;

                  return true;
                }}
              >
                <Background />
                <Controls />
                <FlowToolbar
                  onAddCondition={() => addNode('condition')}
                  onAddGroup={() => addNode('conditionGroup')}
                  onAddResult={() => addNode('result')}
                />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};
