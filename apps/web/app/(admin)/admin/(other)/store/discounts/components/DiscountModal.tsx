'use client';
import Loader from '@/components/Loader';
import {
  Accordion,
  Box,
  Button,
  Center,
  Checkbox,
  Group,
  Modal,
  ModalProps,
  Stack,
  Text,
} from '@mantine/core';
import { DiscountItem } from '@repo/types';
import { useEffect, useState } from 'react';

interface DiscountModalProps {
  opened: boolean;
  onClose: () => void;
  data: DiscountItem[];
  dataTitle?: string;
  isLoading: boolean;
  modalProps?: Omit<ModalProps, 'onClose' | 'opened'>;
  selectedItems?: string[];
  onSave: (selectedIds: string[]) => void;

  subAsVariantsMode?: boolean;
}

const DiscountModal = ({
  data,
  isLoading,
  onClose,
  opened,
  modalProps,
  selectedItems = [],
  onSave,
  dataTitle,
  subAsVariantsMode = false,
}: DiscountModalProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (opened) {
      setSelected(new Set(selectedItems));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const getAllChildIds = (item: DiscountItem): string[] => {
    const ids = [item.id];
    if (item.sub) {
      item.sub.forEach((child) => {
        ids.push(...getAllChildIds(child));
      });
    }
    return ids;
  };

  const isAllChildrenSelected = (item: DiscountItem): boolean => {
    const allIds = getAllChildIds(item);
    return allIds.every((id) => selected.has(id));
  };

  const isSomeChildrenSelected = (item: DiscountItem): boolean => {
    if (!item.sub) return false;
    const allIds = getAllChildIds(item);
    const selectedCount = allIds.filter((id) => selected.has(id)).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  };

  const handleSelect = (item: DiscountItem, checked: boolean) => {
    const newSelected = new Set(selected);
    const allIds = getAllChildIds(item);

    if (checked) {
      allIds.forEach((id) => newSelected.add(id));
    } else {
      allIds.forEach((id) => newSelected.delete(id));
    }
    setSelected(newSelected);
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onClose();
  };

  const renderTree = (items: DiscountItem[], level = 0) => {
    return items.map((item) => {
      const hasSub = item.sub && item.sub.length > 0;
      const isChecked = isAllChildrenSelected(item);
      const isIndeterminate = isSomeChildrenSelected(item);

      if (hasSub && subAsVariantsMode) {
        return (
          <Box key={item.id} style={{ paddingLeft: level > 0 ? 4 : 0 }} my="sm">
            <Checkbox
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={(e) => {
                handleSelect(item, e.currentTarget.checked);
              }}
              label={item.name}
              fw={500}
              mb="xs"
            />
            <Stack gap="xs" style={{ paddingLeft: 20 }}>
              {item.sub!.map((variant) => (
                <Checkbox
                  key={variant.id}
                  checked={selected.has(variant.id)}
                  onChange={(e) =>
                    handleSelect(variant, e.currentTarget.checked)
                  }
                  label={variant.name}
                />
              ))}
            </Stack>
          </Box>
        );
      }

      if (!hasSub) {
        return (
          <Box
            key={item.id}
            style={{
              paddingLeft: level * 20,
            }}
          >
            <Checkbox
              checked={selected.has(item.id)}
              onChange={(e) => handleSelect(item, e.currentTarget.checked)}
              label={item.name}
            />
          </Box>
        );
      }

      return (
        <Box
          key={item.id}
          style={{
            paddingLeft: level > 0 ? 4 : 0,
          }}
        >
          <Accordion variant="default" defaultValue={item.id}>
            <Accordion.Item value={item.id}>
              <Accordion.Control style={{ paddingLeft: level > 0 ? 16 : 0 }}>
                <Checkbox
                  checked={isChecked}
                  indeterminate={isIndeterminate}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelect(item, e.currentTarget.checked);
                  }}
                  label={item.name}
                  onClick={(e) => e.stopPropagation()}
                />
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs" style={{ paddingLeft: 16 }}>
                  {renderTree(item.sub!, level + 1)}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      );
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} size="lg" {...modalProps}>
      <Stack gap="xs">
        {isLoading ? (
          <Center h={400}>
            <Loader />
          </Center>
        ) : (
          <Box
            style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingRight: '1rem',
            }}
          >
            {renderTree(data)}
          </Box>
        )}
        <Group
          justify={dataTitle && selected.size > 0 ? 'space-between' : 'end'}
          mt="lg"
        >
          {dataTitle && selected.size > 0 && (
            <Text>
              {selected.size} {dataTitle} seçildi
            </Text>
          )}
          <Group gap={'xs'}>
            <Button variant="default" onClick={onClose}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DiscountModal;
