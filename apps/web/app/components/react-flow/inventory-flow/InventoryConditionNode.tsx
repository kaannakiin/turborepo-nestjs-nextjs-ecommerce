import { Group, Paper, Text } from '@mantine/core';
import {
  FullfillmentCondition,
  FullfillmentConditionField,
  getDomain,
} from '@repo/types';
import { IconAlertCircle } from '@tabler/icons-react';
import { Node, NodeProps } from '@xyflow/react';
import { memo, useMemo } from 'react';
import {
  GenericConditionNode,
  GenericConditionNodeData,
} from '../builder/GenericConditionNode';

export type FulfillmentConditionNodeData = GenericConditionNodeData<
  FullfillmentConditionField,
  FullfillmentCondition
>;
export type FulfillmentConditionNodeType = Node<
  FulfillmentConditionNodeData,
  'condition'
>;

const InventoryConditionNode = memo(
  ({ data, selected }: NodeProps<FulfillmentConditionNodeType>) => {
    const domainConfig = useMemo(() => {
      return getDomain<FullfillmentConditionField, FullfillmentCondition>(
        'fulfillment',
      );
    }, []);

    if (!domainConfig) {
      return (
        <Paper p="xs" withBorder c="red">
          <Group>
            <IconAlertCircle size={16} />
            <Text size="xs">Fulfillment domain not registered!</Text>
          </Group>
        </Paper>
      );
    }

    return (
      <GenericConditionNode<FullfillmentConditionField, FullfillmentCondition>
        data={data}
        selected={selected}
        domainConfig={domainConfig}
        headerColor="orange"
        headerBgColor="var(--mantine-color-orange-0)"
        headerTitle="ENVANTER KURALI"
      />
    );
  },
);

InventoryConditionNode.displayName = 'FulfillmentConditionNode';
export default InventoryConditionNode;
