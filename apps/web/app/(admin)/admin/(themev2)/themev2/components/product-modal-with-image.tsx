import fetchWrapper, { ApiError } from "@lib/fetchWrapper";
import { Modal } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { ProductModalData } from "@repo/types";

interface ProductModalWithImageProps {
  onSubmit: (data: ProductModalData | Array<ProductModalData>) => void;
  initialData: ProductModalData | Array<ProductModalData> | null | undefined;
  opened: boolean;
  onClose: () => void;
  multiple?: boolean;
}

const ProductModalWithImage = ({
  onSubmit,
  initialData,
  opened,
  onClose,
  multiple = false,
}: ProductModalWithImageProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["product-modal-with-image", initialData || "none"],
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        data: Array<ProductModalData>;
        total: number;
      }>("/admin/products/get-admin-searchable-product-modal-data");

      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error?.error || "Failed to fetch data");
      }
      if (!res.data.data) {
        throw new Error("No data found");
      }

      return res.data;
    },
    enabled: opened,
    initialData: {
      data: initialData
        ? Array.isArray(initialData)
          ? initialData
          : [initialData]
        : [],
      total: initialData
        ? Array.isArray(initialData)
          ? initialData.length
          : 1
        : 0,
    },
  });

  return (
    <>
      <Modal opened={opened} onClose={onClose}></Modal>
    </>
  );
};

export default ProductModalWithImage;
