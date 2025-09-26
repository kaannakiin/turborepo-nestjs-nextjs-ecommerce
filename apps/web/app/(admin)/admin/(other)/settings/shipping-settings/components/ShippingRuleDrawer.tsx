"use client";

import { getCurrencyLabel } from "@lib/helpers";
import {
  Card,
  Divider,
  Group,
  Modal,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Controller, useForm, zodResolver } from "@repo/shared";
import { $Enums, ShippingRuleSchema, ShippingRuleType } from "@repo/types";
import { IconPackage } from "@tabler/icons-react";
import ProductPriceNumberInput from "../../../product-list/create-variant/components/ProductPriceNumberInput";

interface ShippingRuleDrawerProps {
  openedRuleModal: boolean;
  closeRuleModal: () => void;
  defaultValues?: ShippingRuleType;
}

const ShippingRuleDrawer = ({
  openedRuleModal,
  closeRuleModal,
  defaultValues,
}: ShippingRuleDrawerProps) => {
  const { control, handleSubmit, watch } = useForm<ShippingRuleType>({
    resolver: zodResolver(ShippingRuleSchema),
    defaultValues: defaultValues || {
      condition: {
        type: "SalesPrice",
        minSalesPrice: 0,
        maxSalesPrice: 0,
      },
      currency: "TRY",
      name: "",
      shippingPrice: 0,
    },
  });

  const conditionType = watch("condition.type");
  const data = watch();
  const price = watch("shippingPrice");
  const getSubLabel = () => {
    if (!data.name?.trim()) return "Aşağıdaki alanları doldurun";

    return conditionType === "SalesPrice"
      ? "Satış fiyatına göre kargo kuralı"
      : "Ürün ağırlığına göre kargo kuralı";
  };

  return (
    <Modal.Root
      classNames={{
        title: "text-lg font-medium",
        header: "border-b border-b-gray-500",
        body: "py-4 max-h-[50vh]",
      }}
      centered
      size="md"
      opened={openedRuleModal}
      onClose={closeRuleModal}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Kural Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack gap={"md"}>
            <Card bg={"gray.5"} p="md">
              <Group justify="space-between">
                <Text fz={"xs"} c="white">
                  Kural{" "}
                  {conditionType === "ProductWeight"
                    ? "(Ağırlık)"
                    : "(Satış Fiyatı)"}
                </Text>
                <Text fz={"xs"} c={"white"}>
                  buraya 1000 tl ve üzeri gelecek
                </Text>
              </Group>
              <Divider my={"xs"} />
              <Group justify="space-between">
                <Group gap="xs">
                  <IconPackage size={16} color="white" />
                  <Text fz={"xs"} c="white">
                    {data.name?.trim() ? data.name : getSubLabel()}
                  </Text>
                </Group>
                <Text fz={"xs"} c={"white"}>
                  {price > 0
                    ? ` - Kargo Ücreti: ${getCurrencyLabel(data.currency)}${price}`
                    : " Ücretsiz Kargo"}
                </Text>
              </Group>
            </Card>

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  error={fieldState.error?.message}
                  label="Kural Adı"
                  withAsterisk
                  size="xs"
                />
              )}
            />
            <SimpleGrid cols={2}>
              <Controller
                control={control}
                name="currency"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    error={fieldState.error?.message}
                    label="Para Birimi"
                    withAsterisk
                    allowDeselect={false}
                    size="xs"
                    data={Object.values($Enums.Currency).map((currency) => ({
                      value: currency,
                      label: getCurrencyLabel(currency),
                    }))}
                  />
                )}
              />
              <Controller
                control={control}
                name="shippingPrice"
                render={({ field }) => (
                  <ProductPriceNumberInput
                    {...field}
                    label="Kargo Fiyatı"
                    size="xs"
                  />
                )}
              />
            </SimpleGrid>
            <Divider mt={"xs"} size={"md"} />

            <Controller
              control={control}
              name="condition.type"
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  label={
                    <Text fz={"md"} fw={700} mb={"xs"}>
                      Kurallar
                    </Text>
                  }
                >
                  <Group>
                    <Radio
                      size="xs"
                      value={"SalesPrice"}
                      label={
                        <Text fz={"xs"} c="black">
                          Satış Fiyatı
                        </Text>
                      }
                    />
                    <Radio
                      value={"ProductWeight"}
                      size="xs"
                      label={
                        <Text fz={"xs"} c="black">
                          Ağırlık
                        </Text>
                      }
                    />
                  </Group>
                </Radio.Group>
              )}
            />
            <SimpleGrid cols={2}>
              {conditionType === "ProductWeight" ? (
                <>
                  <Controller
                    control={control}
                    name="condition.minProductWeight"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        label="Minimum Ağırlık (g)"
                        size="xs"
                        {...field}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="condition.maxProductWeight"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        label="Maximum Ağırlık (g)"
                        size="xs"
                        {...field}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="condition.minSalesPrice"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        label="Minimum Satış Fiyatı"
                        size="xs"
                        {...field}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="condition.maxSalesPrice"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        label="Maximum Satış Fiyatı"
                        size="xs"
                        {...field}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </>
              )}
            </SimpleGrid>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ShippingRuleDrawer;
