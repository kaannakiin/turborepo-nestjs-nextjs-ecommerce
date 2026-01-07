import { Group, Paper, Text } from "@mantine/core";
import {
  FulfillmentCondition,
  FulfillmentConditionField,
  getDomain,
} from "@repo/types";
import { IconAlertCircle } from "@tabler/icons-react";
import { Node, NodeProps } from "@xyflow/react";
import { memo, useMemo } from "react";
import {
  GenericConditionGroupNode,
  GenericConditionGroupNodeData,
} from "../builder/GenericConditionGroupNode";

export type FulfillmentGroupNodeData = GenericConditionGroupNodeData<
  FulfillmentConditionField,
  FulfillmentCondition
>;

export type FulfillmentGroupNodeType = Node<
  FulfillmentGroupNodeData,
  "conditionGroup"
>;

const InventoryConditionGroupNode = memo(
  ({ data, selected }: NodeProps<FulfillmentGroupNodeType>) => {
    const domainConfig = useMemo(() => {
      return getDomain<FulfillmentConditionField, FulfillmentCondition>(
        "fulfillment"
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
      <GenericConditionGroupNode<
        FulfillmentConditionField,
        FulfillmentCondition
      >
        data={data}
        selected={selected}
        domainConfig={domainConfig}
        defaultField={FulfillmentConditionField.ORDER_TOTAL}
        headerColor="violet"
        headerBgColor="var(--mantine-color-violet-0)"
        headerTitle="KOŞUL GRUBU (VE/VEYA)"
      />
    );
  }
);

InventoryConditionGroupNode.displayName = "InventoryGroupNode";
export default InventoryConditionGroupNode;
