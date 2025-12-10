"use client";

import AdminBrandDataSelect from "@/components/inputs/AdminBrandDataSelect";
import AdminCategoryDataSelect from "@/components/inputs/AdminCategoryDataSelect";
import AdminTagDataSelect from "@/components/inputs/AdminTagDataSelect";
import SegmentedValues from "@/components/inputs/SegmentedValues";
import { getCurrencyLabel } from "@lib/helpers";
import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  TextInput,
} from "@mantine/core";
import { Currency } from "@repo/database/client";
import {
  Controller,
  SubmitHandler,
  useForm,
  useWatch,
  zodResolver,
} from "@repo/shared";
import {
  productFilterDefaultValues,
  ProductFilterFormValues,
  ProductFilterSchema,
} from "@repo/types";
import { useEffect, useState } from "react";

interface FilterModalProps {
  opened: boolean;
  onClose: () => void;
  onApply: (values: ProductFilterFormValues) => void;
  tab?: FilterModalTabType;
  initialValues: ProductFilterFormValues;
}

type FilterModalTabType = "new" | "exists";

const STOCK_DATA = [
  { label: "Hepsi", value: "all" },
  { label: "Stokta Var", value: "true" },
  { label: "Stok Yok", value: "false" },
];

const ACTIVE_DATA = [
  { label: "Hepsi", value: "all" },
  { label: "Aktif", value: "true" },
  { label: "Pasif", value: "false" },
];

const VARIANT_DATA = [
  { label: "Hepsi", value: "all" },
  { label: "Varyantlı", value: "true" },
  { label: "Tekil", value: "false" },
];

const FilterModal = ({
  opened,
  onClose,
  onApply,
  tab = "new",
  initialValues,
}: FilterModalProps) => {
  const [currentTab, setCurrentTab] = useState<FilterModalTabType>(tab);

  const form = useForm<ProductFilterFormValues>({
    resolver: zodResolver(ProductFilterSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (opened) {
      form.reset(initialValues);
    }
  }, [opened, initialValues, form]);

  const handleClear = () => {
    const defaults = { ...productFilterDefaultValues };
    form.reset(defaults);
    onApply(defaults);
  };

  const isSavedFilterChecked = useWatch({
    control: form.control,
    name: "isSavedFilter",
  });

  const onSubmit: SubmitHandler<ProductFilterFormValues> = (
    data: ProductFilterFormValues
  ) => {
    onApply(data);
  };

  const getSegmentValue = (value: boolean | null | undefined): string => {
    if (value === true) return "true";
    if (value === false) return "false";
    return "all";
  };

  const parseSegmentValue = (value: string): boolean | null => {
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={"lg"}
      title="Gelişmiş Ürün Filtreleme"
      classNames={{
        header: "border-b border-b-gray-200 mb-4",
        body: "px-4 pb-4",
      }}
    >
      <Tabs
        value={currentTab}
        onChange={(value) =>
          setCurrentTab((value as FilterModalTabType) || "new")
        }
        variant="pills"
      >
        <Tabs.List grow>
          <Tabs.Tab value="new">Yeni Filtre</Tabs.Tab>
          <Tabs.Tab value="exists">Kayıtlı Filtreler</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="new" pt="md">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stack gap={"md"}>
              <Controller
                control={form.control}
                name="brandIds"
                render={({ field, fieldState }) => (
                  <AdminBrandDataSelect
                    multiple
                    onChange={field.onChange}
                    value={field.value}
                    props={{ error: fieldState.error?.message }}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="categoryIds"
                render={({ field, fieldState }) => (
                  <AdminCategoryDataSelect
                    multiple
                    onChange={field.onChange}
                    value={field.value}
                    props={{ error: fieldState.error?.message }}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="tagIds"
                render={({ field, fieldState }) => (
                  <AdminTagDataSelect
                    multiple
                    onChange={field.onChange}
                    value={field.value}
                    props={{ error: fieldState.error?.message }}
                  />
                )}
              />

              <SimpleGrid cols={3}>
                <Controller
                  control={form.control}
                  name="minPrice"
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      label="Minimum Fiyat"
                      min={0}
                      hideControls
                      error={fieldState.error?.message}
                      value={field.value ?? ""}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="maxPrice"
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      label="Maksimum Fiyat"
                      min={0}
                      hideControls
                      error={fieldState.error?.message}
                      value={field.value ?? ""}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="currency"
                  render={({ field, fieldState }) => (
                    <Select
                      {...field}
                      label="Para Birimi"
                      data={Object.values(Currency).map((data) => ({
                        value: data,
                        label: getCurrencyLabel(data),
                      }))}
                      allowDeselect={false}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </SimpleGrid>

              <SimpleGrid cols={1} spacing="md">
                <Controller
                  control={form.control}
                  name="hasStock"
                  render={({ field }) => (
                    <SegmentedValues
                      label="Stok Durumu"
                      value={getSegmentValue(field.value)}
                      onChange={(val) => field.onChange(parseSegmentValue(val))}
                      data={STOCK_DATA}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <SegmentedValues
                      label="Yayın Durumu"
                      value={getSegmentValue(field.value)}
                      onChange={(val) => field.onChange(parseSegmentValue(val))}
                      data={ACTIVE_DATA}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="isVariant"
                  render={({ field }) => (
                    <SegmentedValues
                      label="Ürün Tipi"
                      value={getSegmentValue(field.value)}
                      onChange={(val) => field.onChange(parseSegmentValue(val))}
                      data={VARIANT_DATA}
                    />
                  )}
                />
              </SimpleGrid>

              <Paper withBorder p="md" bg="gray.0" radius="md" mt="md">
                <Stack gap="xs">
                  <Controller
                    control={form.control}
                    name="isSavedFilter"
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        label="Bu filtreyi daha sonra kullanmak için kaydet"
                        checked={value}
                        onChange={(event) =>
                          onChange(event.currentTarget.checked)
                        }
                      />
                    )}
                  />

                  {isSavedFilterChecked === true && (
                    <Controller
                      control={form.control}
                      name="saveFilterName"
                      render={({ field, fieldState }) => (
                        <TextInput
                          {...field}
                          label="Filtre Adı"
                          withAsterisk
                          error={fieldState.error?.message}
                          value={field.value ?? ""}
                        />
                      )}
                    />
                  )}
                </Stack>
              </Paper>

              <Group justify="right" mt="md">
                <Button variant="light" color="red" onClick={handleClear}>
                  Temizle
                </Button>
                <Button type="submit">Filtrele</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="exists" pt="md">
          <div className="text-center text-gray-500 py-10">
            Henüz kayıtlı filtre bulunmuyor.
          </div>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default FilterModal;
