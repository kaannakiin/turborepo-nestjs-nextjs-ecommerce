"use client";
import fetchWrapper from "@lib/fetchWrapper";
import { Group, Modal, TextInput } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { useQuery } from "@repo/shared";
import { SearchableProductModalData } from "@repo/types";
import { IconSearch } from "@tabler/icons-react";

interface SearchableProductModalProps {
  opened: boolean;
  onClose: () => void;
}

const SearchableProductModal = ({
  onClose,
  opened,
}: SearchableProductModalProps) => {
  const [search, setSearch] = useDebouncedState<string>("", 500);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-searchable-product-modal", { search }],
    queryFn: async () => {
      const res = await fetchWrapper.get<Array<SearchableProductModalData>>(
        `/admin/products/get-admin-searchable-product-modal-data${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );

      if (!res.success) {
        throw new Error("Failed to fetch products");
      }
      return res.data;
    },
  });

  return (
    <Modal.Root opened={opened} onClose={close} centered size={"lg"}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Group gap={"xs"} align="center">
            <TextInput
              defaultValue={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              variant="filled"
              rightSection={<IconSearch />}
              placeholder="Ürün Ara"
            />
          </Group>
        </Modal.Header>
        <Modal.Body>{search}</Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default SearchableProductModal;
