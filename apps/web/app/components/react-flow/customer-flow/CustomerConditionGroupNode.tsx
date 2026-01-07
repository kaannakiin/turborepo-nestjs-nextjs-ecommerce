import {
  CustomerGroupSmartFields,
  customerSegmentDomain,
  SegmentCondition,
} from "@repo/types";
import { IconFilter } from "@tabler/icons-react";
import { type Node, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import {
  GenericConditionGroupNode,
  GenericConditionGroupNodeData,
} from "../builder/GenericConditionGroupNode";

export type CustomerConditionGroupNodeData = GenericConditionGroupNodeData<
  CustomerGroupSmartFields,
  SegmentCondition
>;

export type CustomerConditionGroupNodeType = Node<
  CustomerConditionGroupNodeData,
  "conditionGroup"
>;

const CustomerConditionGroupNode = memo(
  ({ data, selected }: NodeProps<CustomerConditionGroupNodeType>) => {
    return (
      <GenericConditionGroupNode<CustomerGroupSmartFields, SegmentCondition>
        data={data}
        selected={selected}
        domainConfig={customerSegmentDomain}
        defaultField={CustomerGroupSmartFields.ORDER_COUNT}
        headerColor="violet"
        headerBgColor="var(--mantine-color-violet-0)"
        headerTitle="MÜŞTERİ KOŞUL GRUBU"
      />
    );
  }
);

CustomerConditionGroupNode.displayName = "CustomerConditionGroupNode";
export default CustomerConditionGroupNode;
