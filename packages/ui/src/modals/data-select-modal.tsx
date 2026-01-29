"use client";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  ModalProps,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import Loader from "../common/Loader";

export interface DataSelectModalProps<T> extends Omit<ModalProps, "onSubmit"> {
  data: T[];
  isLoading?: boolean;
  selectedIds: string[];
  onSubmit: (selectedItems: T[]) => void;
  idKey: keyof T;
  labelKey: keyof T;
  searchKeys?: (keyof T)[];
  searchFn?: (item: T, query: string) => boolean;
  searchPlaceholder?: string;
  clearAllText?: string;
  cancelText?: string;
  submitText?: string;
  emptyText?: string;
  renderItem?: (item: T) => React.ReactNode;
}

const DataSelectModal = <T,>({
  data,
  isLoading,
  selectedIds,
  onSubmit,
  idKey,
  labelKey,
  searchKeys,
  searchFn,
  searchPlaceholder = "Ara...",
  clearAllText = "Tümünü Temizle",
  cancelText = "İptal",
  submitText = "Kaydet",
  emptyText = "Sonuç bulunamadı",
  renderItem,
  onClose,
  ...props
}: DataSelectModalProps<T>) => {
  const [searchQuery, setSearchQuery] = useDebouncedState("", 500);
  const [localSelectedIds, setLocalSelectedIds] =
    useState<string[]>(selectedIds);

  useEffect(() => {
    if (props.opened) {
      setLocalSelectedIds(selectedIds);
    }
  }, [props.opened, selectedIds]);

  const keysToSearch = searchKeys || [labelKey];

  const filteredData =
    searchQuery.trim() !== ""
      ? data.filter((item) => {
          if (searchFn) {
            return searchFn(item, searchQuery.trim());
          }
          return keysToSearch.some((key) => {
            const value = item[key];
            if (typeof value === "string") {
              return value
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase());
            }
            return false;
          });
        })
      : data;

  const handleToggle = (id: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    const selectedItems = data.filter((item) =>
      localSelectedIds.includes(String(item[idKey])),
    );
    onSubmit(selectedItems);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal.Root
      classNames={{
        title: "text-lg font-medium",
        header: "border-b border-b-gray-500",
        body: "py-0 max-h-[70vh]",
      }}
      centered
      size="lg"
      onClose={handleClose}
      {...props}
    >
      <Modal.Overlay transitionProps={{ transition: "scale", duration: 300 }} />
      <Modal.Content>
        <Modal.Header className="flex flex-col gap-3">
          <Group justify="space-between" className="w-full">
            <Modal.Title>{props.title}</Modal.Title>
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
          <Stack gap="lg">
            {isLoading ? (
              <Loader />
            ) : (
              <ScrollArea h={400} type="always">
                <Stack gap="xs">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => {
                      const itemId = String(item[idKey]);
                      const isSelected = localSelectedIds.includes(itemId);

                      return (
                        <Group
                          className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                          key={itemId}
                          align="center"
                          gap="lg"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggle(itemId);
                          }}
                        >
                          <Checkbox readOnly checked={isSelected} />
                          {renderItem ? (
                            renderItem(item)
                          ) : (
                            <Text>{String(item[labelKey])}</Text>
                          )}
                        </Group>
                      );
                    })
                  ) : (
                    <Text ta="center" c="dimmed">
                      {emptyText}
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        </Modal.Body>
        <Group
          p="md"
          justify={localSelectedIds.length > 0 ? "space-between" : "end"}
          className="border-t border-gray-300"
        >
          {localSelectedIds.length > 0 && (
            <Button
              variant="subtle"
              color="red"
              onClick={() => setLocalSelectedIds([])}
            >
              {clearAllText}
            </Button>
          )}
          <Group>
            <Button variant="default" onClick={handleClose}>
              {cancelText}
            </Button>
            <Button onClick={handleSave}>{submitText}</Button>
          </Group>
        </Group>
      </Modal.Content>
    </Modal.Root>
  );
};

export default DataSelectModal;
