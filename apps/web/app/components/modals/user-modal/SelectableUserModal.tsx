"use client";

import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { User } from "@repo/database/client";
import { keepPreviousData, useQuery } from "@repo/shared";
import { Pagination as PaginationType } from "@repo/types";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface SelectableUserModalProps {
  opened: boolean;
  onClose: () => void;
  selectedIds?: string[];
  onSubmit?: (selectedUsers: User[]) => void;
  multiple?: boolean;
  title?: string;
}

const SelectableUserModal = ({
  opened,
  onClose,
  selectedIds = [],
  onSubmit,
  multiple = true,
  title = "Kullanıcı Seç",
}: SelectableUserModalProps) => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useDebouncedState<string>("", 500);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(selectedIds)
  );
  const [selectedUsersData, setSelectedUsersData] = useState<Map<string, User>>(
    new Map()
  );
  useEffect(() => {
    if (opened) {
      setSelectedUserIds(new Set(selectedIds));
    }
  }, [opened, selectedIds]);
  const { data, isLoading } = useQuery({
    queryKey: ["selectable-user-modal-users", page, search],
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        users: User[];
        pagination?: PaginationType;
      }>("/admin/users/get-user-infos", {
        params: {
          ...(page > 1 ? { page } : {}),
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      });
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(
          error.error || "Kullanıcılar getirilirken bir hata oluştu."
        );
      }
      return res.data;
    },
    enabled: opened,
    placeholderData: keepPreviousData,
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const isUserSelected = (userId: string) => selectedUserIds.has(userId);

  const handleUserToggle = (user: User) => {
    if (multiple) {
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(user.id)) {
          newSet.delete(user.id);
        } else {
          newSet.add(user.id);
        }
        return newSet;
      });
      setSelectedUsersData((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(user.id)) {
          newMap.delete(user.id);
        } else {
          newMap.set(user.id, user);
        }
        return newMap;
      });
    } else {
      setSelectedUserIds(new Set([user.id]));
      setSelectedUsersData(new Map([[user.id, user]]));
    }
  };

  const handleSubmit = () => {
    onSubmit?.(Array.from(selectedUsersData.values()));
    onClose();
  };

  const handleClose = () => {
    setSelectedUserIds(new Set());
    setSelectedUsersData(new Map());
    setPage(1);
    onClose();
  };

  const getInitials = (name: string, surname: string) => {
    return `${name?.[0] ?? ""}${surname?.[0] ?? ""}`.toUpperCase();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="lg"
      centered
    >
      <Stack gap="md">
        <TextInput
          placeholder="İsim, e-posta veya telefon ile ara..."
          leftSection={<IconSearch size={16} />}
          defaultValue={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <ScrollArea.Autosize mah={400}>
          <Stack gap="xs">
            {isLoading ? (
              <Group justify="center" py="xl">
                <Loader />
              </Group>
            ) : users.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                Kullanıcı bulunamadı
              </Text>
            ) : (
              users.map((user) => {
                const isSelected = isUserSelected(user.id);

                return (
                  <Paper
                    key={user.id}
                    p="sm"
                    withBorder
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected
                        ? "var(--mantine-color-blue-0)"
                        : undefined,
                    }}
                    onClick={() => handleUserToggle(user)}
                  >
                    <Group justify="space-between">
                      <Group gap="sm">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
                          readOnly
                        />
                        <Avatar
                          src={user.imageUrl}
                          radius="xl"
                          size="md"
                          color="blue"
                        >
                          {!user.imageUrl &&
                            getInitials(user.name, user.surname)}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={500}>
                            {user.name} {user.surname}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {user.email ?? user.phone ?? "—"}
                          </Text>
                        </div>
                      </Group>
                      <Badge variant="dot" size="sm">
                        {user.role}
                      </Badge>
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        </ScrollArea.Autosize>

        {pagination && pagination.totalPages > 1 && (
          <Group justify="center">
            <Pagination
              value={page}
              onChange={setPage}
              total={pagination.totalPages}
              size="sm"
            />
          </Group>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={selectedUserIds.size === 0}>
            {selectedUserIds.size > 0
              ? `${selectedUserIds.size} Kullanıcı Seç`
              : "Seç"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default SelectableUserModal;
