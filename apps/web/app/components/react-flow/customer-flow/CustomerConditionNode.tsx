import {
  CustomerGroupSmartFields,
  customerSegmentDomain,
  SegmentCondition,
} from "@repo/types";
import { type Node, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import {
  GenericConditionNode,
  GenericConditionNodeData,
} from "../builder/GenericConditionNode";

export type CustomerConditionNodeData = GenericConditionNodeData<
  CustomerGroupSmartFields,
  SegmentCondition
>;

export type CustomerConditionNodeType = Node<
  CustomerConditionNodeData,
  "condition"
>;

const CustomerConditionNode = memo(
  ({ data, selected }: NodeProps<CustomerConditionNodeType>) => {
    return (
      <GenericConditionNode<CustomerGroupSmartFields, SegmentCondition>
        data={data}
        selected={selected}
        domainConfig={customerSegmentDomain}
        headerColor="blue"
        headerBgColor="var(--mantine-color-blue-0)"
        headerTitle="MÜŞTERİ KOŞULU"
      />
    );
  }
);

CustomerConditionNode.displayName = "CustomerConditionNode";
export default CustomerConditionNode;
