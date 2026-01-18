import { Group, Paper, Text } from '@mantine/core';
import {
  getDomain,
  PaymentRuleCondition,
  PaymentRuleConditionField,
} from '@repo/types';
import { IconAlertCircle } from '@tabler/icons-react';
import { Node, NodeProps } from '@xyflow/react';
import { memo, useMemo } from 'react';
import {
  GenericConditionGroupNode,
  GenericConditionGroupNodeData,
} from '../builder/GenericConditionGroupNode';

export type PaymentRuleGroupNodeData = GenericConditionGroupNodeData<
  PaymentRuleConditionField,
  PaymentRuleCondition
>;

export type PaymentRuleGroupNodeType = Node<
  PaymentRuleGroupNodeData,
  'conditionGroup'
>;

const PaymentConditionGroupNode = memo(
  ({ data, selected }: NodeProps<PaymentRuleGroupNodeType>) => {
    const domainConfig = useMemo(() => {
      return getDomain<PaymentRuleConditionField, PaymentRuleCondition>(
        'paymentRule',
      );
    }, []);

    if (!domainConfig) {
      return (
        <Paper p="xs" withBorder c="red">
          <Group>
            <IconAlertCircle size={16} />
            <Text size="xs">Payment Rule domain not registered!</Text>
          </Group>
        </Paper>
      );
    }

    return (
      <GenericConditionGroupNode<
        PaymentRuleConditionField,
        PaymentRuleCondition
      >
        data={data}
        selected={selected}
        domainConfig={domainConfig}
        defaultField={PaymentRuleConditionField.CART_TOTAL}
        headerColor="blue"
        headerBgColor="var(--mantine-color-blue-0)"
        headerTitle="KOŞUL GRUBU"
      />
    );
  },
);

PaymentConditionGroupNode.displayName = 'PaymentConditionGroupNode';
export default PaymentConditionGroupNode;
