"use client";

import { Checkbox, Modal, ScrollArea, Stack } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { UserIdAndName } from "@repo/types";
import GlobalLoadingOverlay from "../../../../../components/GlobalLoadingOverlay";

interface UsersModalProps {
  opened: boolean;
  onClose: () => void;
  includedUserIds: string[];
  onSelectionChange?: (userIds: string[]) => void;
}

const UsersModal = ({
  opened,
  onClose,
  includedUserIds,
  onSelectionChange,
}: UsersModalProps) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["get-users-id-and-name"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/users/get-users-id-and-name`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = (await response.json()) as UserIdAndName[];
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...new Set([...includedUserIds, userId])]);
    } else {
      onSelectionChange?.(includedUserIds.filter((id) => id !== userId));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      scrollAreaComponent={ScrollArea.Autosize}
      centered
      size={"lg"}
      title={"Kullanıcı Seçimi"}
      className="relative"
    >
      {isLoading || isFetching ? (
        <GlobalLoadingOverlay />
      ) : (
        <Stack gap={"xs"}>
          {data &&
            data.map((user) => (
              <Checkbox
                key={user.id}
                label={user.name}
                checked={includedUserIds.includes(user.id)}
                onChange={(e) =>
                  handleUserToggle(user.id, e.currentTarget.checked)
                }
              />
            ))}
        </Stack>
      )}
    </Modal>
  );
};

export default UsersModal;
