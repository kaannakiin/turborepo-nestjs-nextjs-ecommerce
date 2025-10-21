"use client";

import { safeTransformDiscountType } from "@/(admin)/admin/(other)/store/discounts/helperDiscount";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { getCurrencyLabel, getDiscountTypeLabel } from "@lib/helpers";
import {
  ActionIcon,
  Button,
  Checkbox,
  Divider,
  Group,
  InputDescription,
  InputError,
  MultiSelect,
  NumberInput,
  Radio,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { $Enums } from "@repo/database";
import {
  Controller,
  FieldErrors,
  SubmitHandler,
  useFieldArray,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  DiscountUpsertResponse,
  GrowPriceSchema,
  GrowQuantitySchema,
  MainDiscount,
  MainDiscountSchema,
  MainDiscountSchemaDefaultValue,
} from "@repo/types";
import {
  IconCalendar,
  IconCurrencyLira,
  IconFilter,
  IconPackage,
  IconPercentage,
  IconPlus,
  IconStack2,
  IconTrash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CouponForm from "./CouponForm";
import DiscountConditionForm from "./DiscountConditionForm";
import DiscountCustomerForm from "./DiscountCustomerForm";
import FormCard from "./FormCard";

interface DiscountFormProps {
  defaultValues?: MainDiscount;
}
type BaseType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

const getIcon = (type: $Enums.DiscountType) => {
  switch (type) {
    case "PERCENTAGE":
    case "PERCENTAGE_GROW_QUANTITY":
    case "PERCENTAGE_GROW_PRICE":
      return <IconPercentage />;
    case "FIXED_AMOUNT":
    case "FIXED_AMOUNT_GROW_QUANTITY":
    case "FIXED_AMOUNT_GROW_PRICE":
      return <IconCurrencyLira />;
    case "FREE_SHIPPING":
      return <IconTruckDelivery />;
  }
};

const getInitialStates = (type: $Enums.DiscountType) => {
  if (type === "PERCENTAGE") {
    return {
      baseType: "PERCENTAGE" as const,
      discountMode: "simple" as const,
      tieredBy: "quantity" as const,
    };
  } else if (type === "PERCENTAGE_GROW_QUANTITY") {
    return {
      baseType: "PERCENTAGE" as const,
      discountMode: "tiered" as const,
      tieredBy: "quantity" as const,
    };
  } else if (type === "PERCENTAGE_GROW_PRICE") {
    return {
      baseType: "PERCENTAGE" as const,
      discountMode: "tiered" as const,
      tieredBy: "price" as const,
    };
  } else if (type === "FIXED_AMOUNT") {
    return {
      baseType: "FIXED_AMOUNT" as const,
      discountMode: "simple" as const,
      tieredBy: "quantity" as const,
    };
  } else if (type === "FIXED_AMOUNT_GROW_QUANTITY") {
    return {
      baseType: "FIXED_AMOUNT" as const,
      discountMode: "tiered" as const,
      tieredBy: "quantity" as const,
    };
  } else if (type === "FIXED_AMOUNT_GROW_PRICE") {
    return {
      baseType: "FIXED_AMOUNT" as const,
      discountMode: "tiered" as const,
      tieredBy: "price" as const,
    };
  } else if (type === "FREE_SHIPPING") {
    return {
      baseType: "FREE_SHIPPING" as const,
      discountMode: "simple" as const,
      tieredBy: "quantity" as const,
    };
  }
};

const getDiscountType = (
  base: BaseType,
  mode: DiscountMode,
  tiered: TieredBy
): $Enums.DiscountType => {
  if (base === "PERCENTAGE") {
    if (mode === "simple") {
      return "PERCENTAGE";
    } else {
      return tiered === "quantity"
        ? "PERCENTAGE_GROW_QUANTITY"
        : "PERCENTAGE_GROW_PRICE";
    }
  } else if (base === "FIXED_AMOUNT") {
    if (mode === "simple") {
      return "FIXED_AMOUNT";
    } else {
      return tiered === "quantity"
        ? "FIXED_AMOUNT_GROW_QUANTITY"
        : "FIXED_AMOUNT_GROW_PRICE";
    }
  } else if (base === "FREE_SHIPPING") {
    return "FREE_SHIPPING";
  }
};

type DiscountMode = "simple" | "tiered";
type TieredBy = "quantity" | "price";

const DiscountForm = ({ defaultValues }: DiscountFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<MainDiscount>({
    resolver: zodResolver(MainDiscountSchema),
    defaultValues: defaultValues || MainDiscountSchemaDefaultValue,
  });

  const discountType = watch("type");
  const isAllProducts = watch("conditions.isAllProducts");
  const allowDiscountedItems = watch("allowDiscountedItems");
  const isLimitPurchase = watch("isLimitPurchase");
  const isLimitItemQuantity = watch("isLimitItemQuantity");
  const isLimitTotalUsage = watch("isLimitTotalUsage");
  const isLimitTotalUsagePerCustomer = watch("isLimitTotalUsagePerCustomer");
  const addStartDate = watch("addStartDate");
  const addEndDate = watch("addEndDate");
  const allCustomers = watch("allCustomers");
  const selectedCustomers = watch("otherCustomers");

  const initialStates = getInitialStates(discountType);

  const [baseType, setBaseType] = useState<BaseType>(initialStates.baseType);

  const [discountMode, setDiscountMode] = useState<DiscountMode>(
    initialStates.discountMode
  );
  const [tieredBy, setTieredBy] = useState<TieredBy>(initialStates.tieredBy);

  const handleBaseTypeChange = (value: string) => {
    const newBaseType = value as typeof baseType;
    setBaseType(newBaseType);

    const newMode = "simple";
    setDiscountMode(newMode);

    const newType = getDiscountType(newBaseType, newMode, tieredBy);

    const currentFormValues = getValues();
    const transformedValues = safeTransformDiscountType(
      currentFormValues,
      newType
    );
    reset(transformedValues as MainDiscount);
  };

  const handleDiscountModeChange = (value: string) => {
    const newMode = value as DiscountMode;
    setDiscountMode(newMode);

    const newType = getDiscountType(baseType, newMode, tieredBy);

    const currentFormValues = getValues();
    const transformedValues = safeTransformDiscountType(
      currentFormValues,
      newType
    );

    // ✅ Formu yeni değerlerle resetle
    reset(transformedValues as MainDiscount);
  };
  const handleTieredByChange = (value: string) => {
    const newTieredBy = value as TieredBy;
    setTieredBy(newTieredBy);

    const newType = getDiscountType(baseType, discountMode, newTieredBy);

    // ✅ Mevcut form değerlerini al ve safe bir şekilde dönüştür
    const currentFormValues = getValues();
    const transformedValues = safeTransformDiscountType(
      currentFormValues,
      newType
    );

    // ✅ Formu yeni değerlerle resetle
    reset(transformedValues as MainDiscount);
  };

  const showDiscountModeSection =
    baseType === "PERCENTAGE" || baseType === "FIXED_AMOUNT";
  const showTieredOptions = discountMode === "tiered";

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tiers",
  });

  const addDiscount = () => {
    if (
      discountType === "PERCENTAGE_GROW_QUANTITY" ||
      discountType === "FIXED_AMOUNT_GROW_QUANTITY"
    ) {
      const lastTier = fields[fields.length - 1];
      const lastMaxQuantity =
        (lastTier as GrowQuantitySchema["tiers"][number])?.maxQuantity || 0;

      append({
        minQuantity: lastMaxQuantity + 1,
        maxQuantity: null,
        discountPercentage:
          discountType === "PERCENTAGE_GROW_QUANTITY" ? 0 : undefined,
        discountAmount:
          discountType === "FIXED_AMOUNT_GROW_QUANTITY" ? 0 : undefined,
      } as GrowQuantitySchema["tiers"][number]);
    } else {
      const lastTier = fields[fields.length - 1];
      const lastMaxAmount =
        (lastTier as GrowPriceSchema["tiers"][number])?.maxAmount || 0;

      append({
        minAmount: lastMaxAmount + 1,
        maxAmount: null,
        discountPercentage:
          discountType === "PERCENTAGE_GROW_PRICE" ? 0 : undefined,
        discountAmount:
          discountType === "FIXED_AMOUNT_GROW_PRICE" ? 0 : undefined,
      } as GrowPriceSchema["tiers"][number]);
    }
  };
  const { push } = useRouter();
  const onSubmit: SubmitHandler<MainDiscount> = async (data) => {
    const res = await fetchWrapper.post<DiscountUpsertResponse>(
      "/admin/discounts/upgrade-or-create",
      data
    );

    if (!res.success) {
      notifications.show({
        title: "Hata",
        message: "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyiniz.", // veya "Bilinmeyen bir hata oluştu..."
        color: "red",
      });
      return;
    }

    if (!res.data.success) {
      notifications.show({
        title: "Hata",
        message: res.data.message,
        color: "red",
      });
    }

    push("/admin/store/discounts");

    notifications.show({
      title: "Başarılı",
      message: res.data.message,
      color: "green",
    });
  };

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Stack gap={"md"} className="max-w-5xl lg:mx-auto">
        <Group justify="space-between">
          <Title order={4}>
            İndirim {defaultValues ? "Düzenle" : "Oluştur"}{" "}
          </Title>
          <Button
            variant="filled"
            onClick={handleSubmit(onSubmit)}
            type="button"
          >
            {defaultValues ? "Güncelle" : "Oluştur"}
          </Button>
        </Group>
        <FormCard title="Başlık">
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                error={fieldState.error?.message}
                label="Başlık"
                withAsterisk
                description="Müşteriler bu başlığı alışveriş sepetinde ve ödeme sayfasında görecekler."
              />
            )}
          />
        </FormCard>

        <FormCard title="İndirim Türü Seçimi">
          <Radio.Group value={baseType} onChange={handleBaseTypeChange}>
            <SimpleGrid cols={{ base: 2, md: 4 }}>
              {(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"] as const).map(
                (type) => (
                  <Radio.Card
                    key={type}
                    value={type}
                    className={`border border-gray-400 rounded-xl ${
                      baseType === type
                        ? "bg-[var(--mantine-primary-color-1)]"
                        : ""
                    }`}
                    p="md"
                  >
                    <Group justify="space-between" align="center">
                      <Group gap={"xs"} align="center">
                        <ThemeIcon
                          className="text-center"
                          variant={baseType === type ? "filled" : "light"}
                          radius={"lg"}
                          size={"lg"}
                        >
                          {getIcon(type)}
                        </ThemeIcon>
                        <Text size="sm">{getDiscountTypeLabel(type)}</Text>
                      </Group>
                      <Radio.Indicator />
                    </Group>
                  </Radio.Card>
                )
              )}
            </SimpleGrid>
          </Radio.Group>
        </FormCard>

        {showDiscountModeSection && (
          <FormCard title="İndirim Modeli">
            <Radio.Group
              value={discountMode}
              onChange={handleDiscountModeChange}
            >
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                <Radio.Card
                  value="simple"
                  className={`border border-gray-400 rounded-xl ${
                    discountMode === "simple"
                      ? "bg-[var(--mantine-primary-color-1)]"
                      : ""
                  }`}
                  p="md"
                >
                  <Group justify="space-between" align="center">
                    <Group gap={"xs"} align="center">
                      <ThemeIcon
                        variant={discountMode === "simple" ? "filled" : "light"}
                        size={"lg"}
                        radius={"lg"}
                      >
                        {baseType === "PERCENTAGE" ? (
                          <IconPercentage />
                        ) : (
                          <IconCurrencyLira />
                        )}
                      </ThemeIcon>
                      <Text>Basit İndirim</Text>
                    </Group>
                    <Radio.Indicator />
                  </Group>
                </Radio.Card>

                <Radio.Card
                  value="tiered"
                  className={`border border-gray-400 rounded-xl ${
                    discountMode === "tiered"
                      ? "bg-[var(--mantine-primary-color-1)]"
                      : ""
                  }`}
                  p="md"
                >
                  <Group justify="space-between" align="center">
                    <Group gap={"xs"} align="center">
                      <ThemeIcon
                        variant={discountMode === "tiered" ? "filled" : "light"}
                        size={"lg"}
                        radius={"lg"}
                      >
                        <IconStack2 />
                      </ThemeIcon>
                      <Text>Katlı İndirim</Text>
                    </Group>
                    <Radio.Indicator />
                  </Group>
                </Radio.Card>
              </SimpleGrid>
            </Radio.Group>

            {!showTieredOptions ? (
              <Group gap={"sm"}>
                {discountType === "FIXED_AMOUNT" ? (
                  <Controller
                    control={control}
                    name="discountAmount"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        {...field}
                        error={fieldState.error?.message}
                        label="İndirim Tutarı"
                        hideControls
                        allowDecimal
                        decimalScale={2}
                        allowNegative={false}
                        withAsterisk
                      />
                    )}
                  />
                ) : discountType === "PERCENTAGE" ? (
                  <Controller
                    control={control}
                    name="discountValue"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        {...field}
                        withAsterisk
                        label="İndirim Yüzdesi"
                        error={fieldState.error?.message}
                        hideControls
                        min={0}
                        max={100}
                        allowDecimal={false}
                        allowNegative={false}
                      />
                    )}
                  />
                ) : null}
              </Group>
            ) : (
              <Stack gap="sm">
                <Divider />
                <Text size="sm" fw={500}>
                  Katlı indirim türü:
                </Text>
                {(() => {
                  const tiersErrors = (errors as FieldErrors<GrowPriceSchema>)
                    ?.tiers;

                  if (Array.isArray(tiersErrors)) {
                    return (
                      <Stack gap="xs">
                        {tiersErrors.map((tier, index) =>
                          tier?.message ? (
                            <Text key={index} c="red" fz="sm">
                              {tier.message}
                            </Text>
                          ) : null
                        )}
                      </Stack>
                    );
                  }

                  const errorMessage =
                    tiersErrors?.message || tiersErrors?.root?.message;
                  return errorMessage ? (
                    <InputError>{errorMessage}</InputError>
                  ) : null;
                })()}
                <Radio.Group value={tieredBy} onChange={handleTieredByChange}>
                  <Group gap={"xl"}>
                    <Radio value="quantity" label="Sepetteki adete göre" />
                    <Radio value="price" label="Sepetteki tutara göre" />
                  </Group>
                </Radio.Group>

                <Table.ScrollContainer minWidth={"100%"}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>
                          Minimum {tieredBy === "quantity" ? "Adet" : "Tutar"}
                        </Table.Th>
                        <Table.Th>
                          Maksimum
                          {tieredBy === "quantity" ? " Adet" : " Tutar"}
                        </Table.Th>
                        <Table.Th>
                          İndirim
                          {baseType === "PERCENTAGE" ? " Yüzdesi" : " Tutarı"}
                        </Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    {fields && fields.length > 0 && (
                      <Table.Tbody>
                        {fields.map((field, index) => (
                          <Table.Tr key={field.id}>
                            <Table.Td>
                              <Controller
                                control={control}
                                name={
                                  discountType === "FIXED_AMOUNT_GROW_PRICE" ||
                                  discountType === "PERCENTAGE_GROW_PRICE"
                                    ? `tiers.${index}.minAmount`
                                    : `tiers.${index}.minQuantity`
                                }
                                render={({ field, fieldState }) => (
                                  <NumberInput
                                    {...field}
                                    error={fieldState.error?.message}
                                    min={0}
                                    hideControls
                                  />
                                )}
                              />
                            </Table.Td>

                            <Table.Td>
                              <Controller
                                control={control}
                                name={
                                  discountType === "FIXED_AMOUNT_GROW_PRICE" ||
                                  discountType === "PERCENTAGE_GROW_PRICE"
                                    ? `tiers.${index}.maxAmount`
                                    : `tiers.${index}.maxQuantity`
                                }
                                render={({ field, fieldState }) => (
                                  <NumberInput
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(val) =>
                                      field.onChange(val === "" ? null : val)
                                    }
                                    error={fieldState.error?.message}
                                    min={0}
                                    hideControls
                                    placeholder="Sınırsız"
                                  />
                                )}
                              />
                            </Table.Td>

                            <Table.Td>
                              <Controller
                                control={control}
                                name={
                                  discountType === "FIXED_AMOUNT_GROW_PRICE" ||
                                  discountType === "FIXED_AMOUNT_GROW_QUANTITY"
                                    ? `tiers.${index}.discountAmount`
                                    : `tiers.${index}.discountPercentage`
                                }
                                render={({ field, fieldState }) => (
                                  <NumberInput
                                    {...field}
                                    error={fieldState.error?.message}
                                    min={0}
                                    max={
                                      discountType ===
                                        "PERCENTAGE_GROW_PRICE" ||
                                      discountType ===
                                        "PERCENTAGE_GROW_QUANTITY"
                                        ? 100
                                        : undefined
                                    }
                                    hideControls
                                    prefix={
                                      discountType ===
                                        "FIXED_AMOUNT_GROW_PRICE" ||
                                      discountType ===
                                        "FIXED_AMOUNT_GROW_QUANTITY"
                                        ? "₺"
                                        : "%"
                                    }
                                  />
                                )}
                              />
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon
                                variant="transparent"
                                c={"red"}
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                <IconTrash />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    )}
                  </Table>
                </Table.ScrollContainer>
                <Group>
                  <Button
                    variant="light"
                    radius={"md"}
                    leftSection={<IconPlus />}
                    onClick={addDiscount}
                  >
                    İndirim Ekle
                  </Button>
                </Group>
              </Stack>
            )}
          </FormCard>
        )}

        <FormCard title="Koşullar">
          <Controller
            control={control}
            name="conditions.isAllProducts"
            render={({ field }) => (
              <Radio.Group
                {...field}
                value={field.value ? "all" : "specific"}
                onChange={(value) => {
                  const newValue = value === "all";
                  field.onChange(newValue);

                  if (newValue) {
                    setValue("conditions.conditions", null);
                  }
                }}
              >
                <SimpleGrid cols={{ base: 1, md: 4 }}>
                  <Radio.Card
                    className={`border border-gray-400 rounded-xl ${
                      field.value ? "bg-[var(--mantine-primary-color-1)]" : ""
                    }`}
                    p="md"
                    value="all"
                    checked={field.value}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap={"xs"}>
                        <ThemeIcon
                          size={"lg"}
                          radius={"lg"}
                          variant={field.value ? "filled" : "light"}
                        >
                          <IconPackage />
                        </ThemeIcon>
                        <Text>Tüm Ürünler</Text>
                      </Group>
                      <Radio.Indicator />
                    </Group>
                  </Radio.Card>
                  <Radio.Card
                    className={`border border-gray-400 rounded-xl ${
                      !field.value ? "bg-[var(--mantine-primary-color-1)]" : ""
                    }`}
                    p="md"
                    value="specific"
                    checked={!field.value}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap={"xs"}>
                        <ThemeIcon
                          size={"lg"}
                          radius={"lg"}
                          variant={!field.value ? "filled" : "light"}
                        >
                          <IconFilter />
                        </ThemeIcon>
                        <Text>Belirli Ürünler</Text>
                      </Group>
                      <Radio.Indicator />
                    </Group>
                  </Radio.Card>
                </SimpleGrid>
              </Radio.Group>
            )}
          />

          {errors.conditions?.message && (
            <InputError>{errors.conditions?.message}</InputError>
          )}
          <Controller
            control={control}
            name="allowDiscountedItems"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Checkbox
                {...field}
                checked={value || false}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  onChange(checked);
                  if (checked) {
                    setValue(
                      "allowedDiscountedItemsBy",
                      $Enums.AllowedDiscountedItemsBy.price
                    );
                  } else {
                    setValue("allowedDiscountedItemsBy", null);
                  }
                }}
                error={fieldState.error?.message}
                label="İndirimli Ürünleri Kampanyaya Dahil Et"
              />
            )}
          />
          {allowDiscountedItems && (
            <Controller
              control={control}
              name="allowedDiscountedItemsBy"
              render={({ field, fieldState }) => (
                <Radio.Group
                  label="Uygulanacak Fiyat"
                  classNames={{
                    label: "w-full  border-b border-b-gray-300 pb-1 ",
                  }}
                  {...field}
                  error={fieldState.error?.message}
                >
                  <Group gap={"xl"} py={"xs"}>
                    <Radio
                      value={$Enums.AllowedDiscountedItemsBy.price}
                      label="Satış Fiyatı Üzerinden"
                    />
                    <Radio
                      value={$Enums.AllowedDiscountedItemsBy.discounted_price}
                      label="İndirimli Fiyat Üzerinden"
                    />
                  </Group>
                </Radio.Group>
              )}
            />
          )}

          {!isAllProducts && <DiscountConditionForm control={control} />}
        </FormCard>
        <CouponForm control={control} error={errors.coupons?.message} />

        <FormCard
          title={
            <Stack gap={4} p={"md"}>
              <Title order={4}>Gereksinimler</Title>
              <InputDescription>
                Kampanya, müşterilerin sepetinde aşağıdaki şartları sağlanırsa
                uygulanacaktır
              </InputDescription>
            </Stack>
          }
        >
          <Group gap={"md"} align="flex-start">
            <Controller
              control={control}
              name="isLimitPurchase"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  checked={value}
                  {...field}
                  onChange={(e) => {
                    if (!e.currentTarget.checked) {
                      setValue("minPurchaseAmount", null);
                      setValue("maxPurchaseAmount", null);
                    }
                    field.onChange(e);
                  }}
                  error={fieldState.error?.message}
                  mt="xs"
                />
              )}
            />
            <Stack gap={"xs"} style={{ flex: 1 }}>
              <div className="flex flex-col ">
                <Text fz="md" fw={500}>
                  Satın alma tutarını sınırla
                </Text>
                <Text fz="sm" c="dimmed">
                  Belirtilen toplam satın alma tutarını uygulamalı alınan
                  kampanya
                </Text>
              </div>

              {isLimitPurchase && (
                <Group gap={"md"}>
                  <Controller
                    control={control}
                    name="minPurchaseAmount"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        label="Minimum"
                        {...field}
                        error={fieldState.error?.message}
                        hideControls
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        leftSection={<Text>₺</Text>}
                        allowNegative={false}
                        allowDecimal={true}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="maxPurchaseAmount"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        label="Maksimum"
                        {...field}
                        error={fieldState.error?.message}
                        hideControls
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        leftSection={<Text>₺</Text>}
                        allowNegative={false}
                        allowDecimal={true}
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>
          </Group>

          <Group gap={"md"} align="flex-start">
            <Controller
              control={control}
              name="isLimitItemQuantity"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  checked={value}
                  {...field}
                  onChange={(e) => {
                    if (!e.currentTarget.checked) {
                      setValue("minItemQuantity", null);
                      setValue("maxItemQuantity", null);
                    }
                    field.onChange(e);
                  }}
                  error={fieldState.error?.message}
                  mt="xs"
                />
              )}
            />
            <Stack gap={"xs"} style={{ flex: 1 }}>
              <div className="flex flex-col ">
                <Text fz="md" fw={500}>
                  Ürün adetini sınırla
                </Text>
                <Text fz="sm" c="dimmed">
                  Belirtilen toplam ürün adet sayısına uygulamalı alınan
                  kampanya
                </Text>
              </div>
              {isLimitItemQuantity && (
                <Group gap={"md"}>
                  <Controller
                    control={control}
                    name="minItemQuantity"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        label="Minimum"
                        {...field}
                        error={fieldState.error?.message}
                        hideControls
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        allowNegative={false}
                        allowDecimal={false}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="maxItemQuantity"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        label="Maksimum"
                        {...field}
                        error={fieldState.error?.message}
                        hideControls
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        allowNegative={false}
                        allowDecimal={false}
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>
          </Group>
        </FormCard>

        <FormCard title="Ayarlar">
          <Group gap={"md"} align="flex-start">
            <Controller
              control={control}
              name="mergeOtherCampaigns"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  checked={value}
                  {...field}
                  error={fieldState.error?.message}
                  mt="xs"
                />
              )}
            />
            <Stack gap={"xs"} style={{ flex: 1 }}>
              <div className="flex flex-col ">
                <Text fz="md" fw={500}>
                  Diğer Kampanyalarla Birleştirilsin
                </Text>
                <Text fz="sm" c="dimmed">
                  Bu kampanya, müşterilerin sepetinde başka kampanyalar da varsa
                  uygulanabilir.
                </Text>
              </div>
            </Stack>
          </Group>
          <Group gap={"md"} align="flex-start">
            <Controller
              control={control}
              name="isLimitTotalUsage"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  checked={value}
                  {...field}
                  onChange={(e) => {
                    if (!e.currentTarget.checked) {
                      setValue("totalUsageLimit", null);
                    }
                    field.onChange(e);
                  }}
                  error={fieldState.error?.message}
                  mt="xs"
                />
              )}
            />
            <Stack gap={"xs"} style={{ flex: 1 }}>
              <div className="flex flex-col ">
                <Text fz="md" fw={500}>
                  Toplam Kullanım Sayısını Sınırla
                </Text>
                <Text fz="sm" c="dimmed">
                  Kampanyanın toplam kaç kez kullanılabileceğini sınırlar.
                </Text>
              </div>
              {isLimitTotalUsage && (
                <Group gap={"md"}>
                  <Controller
                    control={control}
                    name="totalUsageLimit"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        {...field}
                        error={fieldState.error?.message}
                        hideControls
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        allowNegative={false}
                        allowDecimal={false}
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>
          </Group>
          <Group gap={"md"} align="flex-start">
            <Controller
              control={control}
              name="isLimitTotalUsagePerCustomer"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  checked={value}
                  {...field}
                  onChange={(e) => {
                    if (!e.currentTarget.checked) {
                      setValue("isLimitTotalUsagePerCustomer", null);
                    }
                    field.onChange(e);
                  }}
                  error={fieldState.error?.message}
                  mt="xs"
                />
              )}
            />
            <Stack gap={"xs"} style={{ flex: 1 }}>
              <div className="flex flex-col ">
                <Text fz="md" fw={500}>
                  Müşteri Başına Toplam Kullanım Sayısını Sınırla
                </Text>
                <Text fz="sm" c="dimmed">
                  Kampanyanın her bir müşteri tarafından kaç kez
                  kullanılabileceğini sınırlar.
                </Text>
              </div>
              {isLimitTotalUsagePerCustomer && (
                <Group gap={"md"}>
                  <Controller
                    control={control}
                    name="totalUsageLimitPerCustomer"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        {...field}
                        error={fieldState.error?.message}
                        hideControls
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        allowNegative={false}
                        allowDecimal={false}
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>
          </Group>
        </FormCard>

        <DiscountCustomerForm
          setValue={setValue}
          allCustomers={allCustomers}
          control={control}
          selectedCustomers={selectedCustomers}
        />

        <FormCard title="Aktif Tarihler">
          <Group gap={"md"} align="flex-start">
            <Controller
              control={control}
              name="addStartDate"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  {...field}
                  onChange={(e) => {
                    if (!e.currentTarget.checked) {
                      setValue("startDate", null);
                    }
                    field.onChange(e);
                  }}
                  error={fieldState.error?.message}
                  mt={"xs"}
                  checked={value}
                />
              )}
            />
            <Stack gap={"xs"} style={{ flex: 1 }}>
              <div className="flex flex-col ">
                <Text fz="md" fw={500}>
                  Başlangıç Tarihi Ekle
                </Text>
              </div>
              {addStartDate && (
                <Group>
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field, fieldState }) => (
                      <DateTimePicker
                        {...field}
                        value={field.value ? new Date(field.value) : null}
                        onChange={(date) => {
                          if (date) {
                            const formattedDate = format(
                              date,
                              "yyyy-MM-dd HH:mm:ss"
                            );
                            field.onChange(formattedDate);
                          } else {
                            field.onChange(null);
                          }
                        }}
                        placeholder="Tarih ve saat seçin"
                        error={fieldState.error?.message}
                        minDate={new Date()}
                        valueFormat="DD/MM/YYYY HH:mm"
                        clearable
                        leftSection={<IconCalendar size={16} />}
                      />
                    )}
                  />
                </Group>
              )}
            </Stack>
          </Group>
          <Group gap={"md"} align="flex-start">
            <Controller
              control={control}
              name="addEndDate"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  {...field}
                  checked={value}
                  error={fieldState.error?.message}
                  onChange={(e) => {
                    if (!e.currentTarget.checked) {
                      setValue("endDate", null);
                    }
                    field.onChange(e);
                  }}
                />
              )}
            />
            <Stack gap={"xs"} style={{ flex: 1 }}>
              <div className="flex flex-col ">
                <Text fz="md" fw={500}>
                  Bitiş Tarihi Ekle
                </Text>
              </div>
              {addEndDate && (
                <Group>
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field, fieldState }) => {
                      const startDate = watch("startDate");
                      const minEndDate = startDate
                        ? new Date(
                            new Date(startDate).getTime() + 5 * 60 * 1000
                          )
                        : new Date();
                      return (
                        <DateTimePicker
                          {...field}
                          value={field.value ? new Date(field.value) : null}
                          onChange={(date) => {
                            if (date) {
                              const formattedDate = format(
                                date,
                                "yyyy-MM-dd HH:mm:ss"
                              );
                              field.onChange(formattedDate);
                            } else {
                              field.onChange(null);
                            }
                          }}
                          placeholder="Tarih ve saat seçin"
                          error={fieldState.error?.message}
                          minDate={minEndDate}
                          valueFormat="DD/MM/YYYY HH:mm"
                          clearable
                          leftSection={<IconCalendar size={16} />}
                        />
                      );
                    }}
                  />
                </Group>
              )}
            </Stack>
          </Group>
        </FormCard>
        <FormCard title="Satış Kanalları">
          <Controller
            control={control}
            name="currencies"
            render={({ field, fieldState }) => (
              <MultiSelect
                {...field}
                error={fieldState.error?.message}
                label="Geçerli Kurlar"
                data={Object.values($Enums.Currency).map((currency) => ({
                  value: currency,
                  label: getCurrencyLabel(currency),
                }))}
              />
            )}
          />
        </FormCard>
      </Stack>
    </>
  );
};

export default DiscountForm;
