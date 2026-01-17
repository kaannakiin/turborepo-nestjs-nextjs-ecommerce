'use client';

import {
  Button,
  Checkbox,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Loader from '../Loader';

interface BasicItem {
  id: string;
  name: string;
}

interface BasicItemModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder: string;
  items: BasicItem[] | undefined;
  isLoading: boolean;
  selectedIds: string[];
  onSubmit: (selectedItems: BasicItem[]) => void;
}

const BasicItemModal = ({
  opened,
  onClose,
  title,
  searchPlaceholder,
  items,
  isLoading,
  selectedIds,
  onSubmit,
}: BasicItemModalProps) => {
  const [searchQuery, setSearchQuery] = useDebouncedState<string>('', 500);
  const [localSelectedIds, setLocalSelectedIds] =
    useState<string[]>(selectedIds);

  useEffect(() => {
    if (opened) {
      setLocalSelectedIds(selectedIds);
    }
  }, [opened, selectedIds]);

  const filteredItems =
    searchQuery.trim() !== ''
      ? items?.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
      : items;

  const handleToggle = (id: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    if (!items) return;
    const selectedItems = items.filter((item) =>
      localSelectedIds.includes(item.id),
    );
    onSubmit(selectedItems);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal.Root
      opened={opened}
      classNames={{
        title: 'text-lg font-medium',
        header: 'border-b border-b-gray-500',
        body: 'py-0 max-h-[70vh]',
      }}
      centered
      size="lg"
      onClose={handleCancel}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Modal.Overlay transitionProps={{ transition: 'scale', duration: 300 }} />
      <Modal.Content>
        <Modal.Header className="flex flex-col gap-3">
          <Group justify="space-between" className="w-full">
            <Modal.Title>{title}</Modal.Title>
            <Modal.CloseButton />
          </Group>
          <TextInput
            placeholder={searchPlaceholder}
            className="w-full"
            variant="filled"
            defaultValue={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
        </Modal.Header>
        <Modal.Body className="py-4">
          <Stack gap={'lg'}>
            {isLoading ? (
              <Loader />
            ) : (
              <ScrollArea h={400} type="always">
                <Stack gap="xs">
                  {filteredItems &&
                    filteredItems.length > 0 &&
                    filteredItems.map((item) => (
                      <Group
                        className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                        key={item.id}
                        align="center"
                        gap={'lg'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggle(item.id);
                        }}
                      >
                        <Checkbox
                          readOnly
                          checked={localSelectedIds.includes(item.id)}
                        />
                        <Text>{item.name}</Text>
                      </Group>
                    ))}
                  {(!filteredItems || filteredItems.length === 0) && (
                    <Text ta="center" c="dimmed">
                      Sonuç bulunamadı
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        </Modal.Body>
        <Group
          p="md"
          justify={localSelectedIds.length > 0 ? 'space-between' : 'end'}
          className="border-t border-gray-300"
        >
          {localSelectedIds.length > 0 && (
            <Button
              variant="subtle"
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={() => setLocalSelectedIds([])}
            >
              Tümünü Temizle
            </Button>
          )}
          <Group>
            <Button variant="default" onClick={handleCancel}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </Group>
        </Group>
      </Modal.Content>
    </Modal.Root>
  );
};

export default BasicItemModal;
