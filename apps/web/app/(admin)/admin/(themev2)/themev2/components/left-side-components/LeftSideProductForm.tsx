"use client";

import { Button, Group, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Control, useFieldArray } from "@repo/shared";
import { ProductCarouselComponentInputType, ThemeInputType } from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import ProductModalWithImage from "../product-modal-with-image";

interface LeftSideProductFormProps {
  control: Control<ThemeInputType>;
  index: number;
  field: ProductCarouselComponentInputType;
}
const LeftSideProductForm = ({
  index,
  field,
  control,
}: LeftSideProductFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const productPaths = `components.${index}.items` as const;
  const { fields, append, remove } = useFieldArray({
    control,
    name: productPaths,
  });
  return (
    <>
      {field.items?.length && (
        <>
          {field.items.map((item, index) => (
            <Group key={index}>{item.customTitle || ""}</Group>
          ))}
        </>
      )}
      <Button
        variant="transparent"
        size="sm"
        color="black"
        onClick={() => {
          append({});
        }}
        leftSection={
          <ThemeIcon size="xs" radius="xl" color="black" variant="filled">
            <IconPlus size={24} color="white" />
          </ThemeIcon>
        }
        justify="start"
        fz="xs"
        fw={500}
        px="sm"
        py="xs"
        fullWidth
        className="hover:bg-gray-100"
      >
        Ürün Ekle
      </Button>
      <ProductModalWithImage
        initialData={[]}
        onClose={() => {
          close();
        }}
        onSubmit={(data) => {
          console.log({ data });
        }}
        opened={opened}
      />
    </>
  );
};

export default LeftSideProductForm;
