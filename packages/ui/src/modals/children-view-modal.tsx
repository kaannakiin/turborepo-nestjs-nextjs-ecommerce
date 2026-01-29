"use client";

import {
  Accordion,
  Button,
  Checkbox,
  Group,
  Modal,
  ModalProps,
  Radio,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";

interface ChildrenModalDataType {
  id: string;
  depth: number;
  name: string;
  children: ChildrenModalDataType[];
}

interface ChildrenViewModalProps extends Omit<
  ModalProps,
  "children" | "onSubmit"
> {
  data: ChildrenModalDataType[];
  onSubmit: (selectedIds: string[]) => void;
  selectedIds?: string[];
  multiple?: boolean;
}

const ChildrenViewModal = ({
  data,
  onSubmit,
  onClose,
  selectedIds = [],
  multiple = false,
  ...props
}: ChildrenViewModalProps) => {
  const [selectedIdsSet, setSelectedIdsSet] = useState<Set<string>>(
    new Set(selectedIds),
  );
  const [openedAccordions, setOpenedAccordions] = useState<string[]>([]);

  // Update selection when selectedIds prop changes (pagination)
  useEffect(() => {
    setSelectedIdsSet(new Set(selectedIds));
  }, [selectedIds]);

  // Auto-expand accordions for selected items on data change
  useEffect(() => {
    const accordionsToOpen: string[] = [];

    const findSelectedParents = (items: ChildrenModalDataType[]) => {
      items.forEach((item) => {
        const hasSelectedChild = hasAnySelectedChild(item);
        if (hasSelectedChild || selectedIdsSet.has(item.id)) {
          accordionsToOpen.push(item.id);
        }
        if (item.children.length > 0) {
          findSelectedParents(item.children);
        }
      });
    };

    findSelectedParents(data);
    setOpenedAccordions(accordionsToOpen);
  }, [data, selectedIdsSet]);

  // Helper: Check if item or any descendant is selected
  const hasAnySelectedChild = (item: ChildrenModalDataType): boolean => {
    if (selectedIdsSet.has(item.id)) return true;
    return item.children.some((child) => hasAnySelectedChild(child));
  };

  // Helper: Get all descendant IDs
  const getAllDescendantIds = (item: ChildrenModalDataType): string[] => {
    const ids: string[] = [item.id];
    item.children.forEach((child) => {
      ids.push(...getAllDescendantIds(child));
    });
    return ids;
  };

  // Helper: Check if all children are selected
  const areAllChildrenSelected = (item: ChildrenModalDataType): boolean => {
    if (item.children.length === 0) return selectedIdsSet.has(item.id);
    return item.children.every((child) => areAllChildrenSelected(child));
  };

  // Helper: Check if some (but not all) children are selected
  const areSomeChildrenSelected = (item: ChildrenModalDataType): boolean => {
    if (item.children.length === 0) return false;
    return item.children.some(
      (child) =>
        selectedIdsSet.has(child.id) ||
        areAllChildrenSelected(child) ||
        areSomeChildrenSelected(child),
    );
  };

  const handleToggleSelection = (item: ChildrenModalDataType) => {
    setSelectedIdsSet((prev) => {
      const newSet = new Set(prev);

      if (multiple) {
        // Multiple mode: Toggle parent and all children
        const allIds = getAllDescendantIds(item);
        const isCurrentlySelected = newSet.has(item.id);

        if (isCurrentlySelected) {
          // Deselect all
          allIds.forEach((id) => newSet.delete(id));
        } else {
          // Select all
          allIds.forEach((id) => newSet.add(id));
        }
      } else {
        // Single mode: Only toggle this item
        newSet.clear();
        newSet.add(item.id);
      }

      return newSet;
    });
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedIdsSet));
    if (onClose) onClose();
  };

  const renderItem = (item: ChildrenModalDataType): React.ReactNode => {
    const hasChildren = item.children.length > 0;
    const isSelected = selectedIdsSet.has(item.id);
    const allChildrenSelected = areAllChildrenSelected(item);
    const someChildrenSelected = areSomeChildrenSelected(item);
    const paddingLeft = item.depth * 16;

    if (!hasChildren) {
      // Leaf node: Simple checkbox/radio
      return (
        <div key={item.id} style={{ paddingLeft: `${paddingLeft}px` }}>
          {multiple ? (
            <Checkbox
              label={item.name}
              checked={isSelected}
              onChange={() => handleToggleSelection(item)}
            />
          ) : (
            <Radio
              label={item.name}
              checked={isSelected}
              onChange={() => handleToggleSelection(item)}
            />
          )}
        </div>
      );
    }

    // Parent node: Accordion with checkbox/radio
    return (
      <Accordion.Item key={item.id} value={item.id}>
        <Accordion.Control style={{ paddingLeft: `${paddingLeft}px` }}>
          <Group gap="xs" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
            {multiple ? (
              <Checkbox
                checked={allChildrenSelected}
                indeterminate={!allChildrenSelected && someChildrenSelected}
                onChange={() => handleToggleSelection(item)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Radio
                checked={isSelected}
                onChange={() => handleToggleSelection(item)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <Text size="sm" fw={500}>
              {item.name}
            </Text>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xs">
            {item.children.map((child) => renderItem(child))}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    );
  };

  return (
    <Modal
      {...props}
      onClose={onClose}
      title="Seçim Yapın"
      size="lg"
      styles={{
        body: {
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        },
        header: {
          padding: "var(--mantine-spacing-md)",
          paddingBottom: "var(--mantine-spacing-sm)",
        },
      }}
    >
      <Stack
        gap="md"
        style={{ height: "100%", padding: "0 var(--mantine-spacing-md)" }}
      >
        <Stack
          gap="xs"
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            paddingRight: "4px",
          }}
        >
          <Accordion
            multiple
            variant="contained"
            value={openedAccordions}
            onChange={setOpenedAccordions}
          >
            {data.map((item) => renderItem(item))}
          </Accordion>
        </Stack>

        <Stack
          gap="md"
          style={{
            padding: "var(--mantine-spacing-md) 0",
            borderTop: "1px solid var(--mantine-color-gray-3)",
            backgroundColor: "var(--mantine-color-body)",
          }}
        >
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={() => onClose?.()}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={selectedIdsSet.size === 0}>
              Seç ({selectedIdsSet.size})
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ChildrenViewModal;
