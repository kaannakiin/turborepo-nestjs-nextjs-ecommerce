import { Text } from "@mantine/core";
import { useShallow } from "zustand/react/shallow";

import { ThemePages } from "@repo/types";
import { useThemeStore } from "../../../store/theme-store";
import { SortableListRow } from "../../common/SortableListRow";

interface MarqueeItemRowProps {
  id: string;
  itemId: string;
  text: string;
  index: number;
  componentId: string;
  activePage: ThemePages;
  onRemove: () => void;
}

const MarqueeItemRow = ({
  id,
  itemId,
  text,
  index,
  componentId,
  activePage,
  onRemove,
}: MarqueeItemRowProps) => {
  const { isSelected, selectMarqueeItem, clearSelection } = useThemeStore(
    useShallow((state) => ({
      selectMarqueeItem: state.selectMarqueeItem,
      clearSelection: state.clearSelection,
      isSelected:
        state.selection?.type === "MARQUEE_ITEM" &&
        state.selection.componentId === componentId &&
        state.selection.itemId === itemId,
    }))
  );

  const displayText = text || `Öğe ${index + 1}`;

  const handleClick = () => {
    selectMarqueeItem(componentId, itemId, activePage);
  };

  const handleDelete = () => {
    onRemove();
    if (isSelected) clearSelection();
  };

  return (
    <SortableListRow
      id={id}
      isSelected={isSelected}
      onClick={handleClick}
      onDelete={handleDelete}
    >
      <Text size="sm" truncate>
        {displayText}
      </Text>
    </SortableListRow>
  );
};

export default MarqueeItemRow;
