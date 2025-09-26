"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import {
  getConditionText,
  getCurrencyLabel,
  getCurrencySymbol,
} from "@lib/helpers";
import {
  Button,
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
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  zodResolver,
} from "@repo/shared";
import { $Enums, ShippingRuleSchema, ShippingRuleType } from "@repo/types";
import { IconPackage } from "@tabler/icons-react";
import { useEffect } from "react";
import ProductPriceNumberInput from "../../../product-list/create-variant/components/ProductPriceNumberInput";

interface ShippingRuleDrawerProps {
  openedRuleModal: boolean;
  closeRuleModal: () => void;
  defaultValues?: ShippingRuleType;
  onSubmit: SubmitHandler<ShippingRuleType>;
}

const ShippingRuleDrawer = ({
  openedRuleModal,
  closeRuleModal,
  defaultValues,
  onSubmit,
}: ShippingRuleDrawerProps) => {
  const { control, handleSubmit, watch, setValue, reset } =
    useForm<ShippingRuleType>({
      resolver: zodResolver(ShippingRuleSchema),
      defaultValues: defaultValues || {
        uniqueId: createId(),
        condition: {
          type: "SalesPrice",
          minSalesPrice: null,
          maxSalesPrice: null,
        },
        currency: "TRY",
        name: "",
        shippingPrice: null,
      },
    });
  useEffect(() => {
    if (openedRuleModal) {
      if (defaultValues) {
        // Edit mode - mevcut değerlerle reset et
        reset(defaultValues);
      } else {
        // Add mode - boş değerlerle reset et
        reset({
          uniqueId: createId(),
          condition: {
            type: "SalesPrice",
            minSalesPrice: null,
            maxSalesPrice: null,
          },
          currency: "TRY",
          name: "",
          shippingPrice: null,
        });
      }
    }
  }, [openedRuleModal, defaultValues, reset]);

  const data = watch();
  const price = watch("shippingPrice");

  const getSubLabel = () => {
    if (!data.name?.trim()) return "Aşağıdaki alanları doldurun";

    return data.condition.type === "SalesPrice"
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
                  {data.condition.type === "ProductWeight"
                    ? "(Ağırlık)"
                    : "(Satış Fiyatı)"}
                </Text>
                <Text fz={"xs"} c={"white"}>
                  {getConditionText(data)}
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
                {price > 0 ? (
                  <Group gap={"1px"} wrap="nowrap" align="center">
                    <ProductPriceFormatter
                      fz={"xs"}
                      c={"white"}
                      price={price}
                    />
                    <Text fz={"xs"} c={"white"}>
                      {" "}
                      - Kargo Ücreti
                    </Text>
                  </Group>
                ) : (
                  <Text fz={"xs"} c={"white"}>
                    Ücretsiz Kargo
                  </Text>
                )}
              </Group>
            </Card>

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  data-autofocus
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
                    onChange={(value) => {
                      if (
                        value === "" ||
                        value === null ||
                        value === undefined
                      ) {
                        field.onChange(null);
                      } else {
                        field.onChange(Number(value));
                      }
                    }}
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
                  onChange={(value) => {
                    field.onChange(value as "SalesPrice" | "ProductWeight");
                    if (value === "SalesPrice") {
                      setValue("condition", {
                        type: "SalesPrice",
                        minSalesPrice: null,
                        maxSalesPrice: null,
                      });
                    } else {
                      setValue("condition", {
                        type: "ProductWeight",
                        minProductWeight: null,
                        maxProductWeight: null,
                      });
                    }
                  }}
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
              {data.condition.type === "ProductWeight" ? (
                <>
                  <Controller
                    control={control}
                    name="condition.minProductWeight"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        label="Minimum Ağırlık (g)"
                        size="xs"
                        {...field}
                        onChange={(value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="condition.maxProductWeight"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        label="Maksimum Ağırlık (g)"
                        onChange={(value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
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
                        onChange={(value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="condition.maxSalesPrice"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        label="Maksimum Satış Fiyatı"
                        size="xs"
                        {...field}
                        onChange={(value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          ) {
                            field.onChange(null);
                          } else {
                            field.onChange(Number(value));
                          }
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </>
              )}
            </SimpleGrid>
            <Group justify="end">
              <Button variant="default" onClick={closeRuleModal}>
                İptal
              </Button>
              <Button variant="filled" onClick={handleSubmit(onSubmit)}>
                Kaydet
              </Button>
            </Group>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ShippingRuleDrawer;
