"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { Checkbox, Modal, ScrollArea, Stack } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { UserIdAndName } from "@repo/types";

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
      const response = await fetchWrapper.get<UserIdAndName[]>(
        `/admin/users/get-users-id-and-name`
      );

      if (!response.success) throw new Error("Failed to fetch users");

      return response.data;
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
