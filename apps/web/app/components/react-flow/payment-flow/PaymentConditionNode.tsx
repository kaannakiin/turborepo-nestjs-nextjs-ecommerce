import {
  PaymentRuleConditionField,
  paymentRuleDomain,
  PaymentRuleCondition,
} from '@repo/types';
import { type Node, type NodeProps } from '@xyflow/react';
import { memo } from 'react';

import {
  GenericConditionNode,
  GenericConditionNodeData,
} from '../builder/GenericConditionNode';

export type PaymentConditionNodeData = GenericConditionNodeData<
  PaymentRuleConditionField,
  PaymentRuleCondition
>;

export type PaymentConditionNodeType = Node<
  PaymentConditionNodeData,
  'condition'
>;

const PaymentConditionNode = memo(
  ({ data, selected }: NodeProps<PaymentConditionNodeType>) => {
    return (
      <GenericConditionNode<PaymentRuleConditionField, PaymentRuleCondition>
        data={data}
        selected={selected}
        domainConfig={paymentRuleDomain}
        headerColor="violet"
        headerBgColor="var(--mantine-color-violet-0)"
        headerTitle="ÖDEME KOŞULU"
      />
    );
  },
);

PaymentConditionNode.displayName = 'PaymentConditionNode';
export default PaymentConditionNode;
