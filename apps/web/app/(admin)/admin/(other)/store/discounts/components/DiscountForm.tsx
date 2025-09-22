"use client";

import {
  ActionIcon,
  Button,
  Card,
  CopyButton,
  Divider,
  Group,
  InputDescription,
  InputError,
  Modal,
  MultiSelect,
  NumberInput,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  Controller,
  createId,
  SubmitHandler,
  useFieldArray,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  $Enums,
  DiscountCouponSchema,
  DiscountSchema,
  DiscountZodType,
} from "@repo/types";
import {
  IconCheck,
  IconCopy,
  IconCopyCheck,
  IconCurrencyLira,
  IconEdit,
  IconPercentage,
  IconPlus,
  IconTicket,
  IconTrash,
  IconTruck,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import ProductPriceNumberInput from "../../../product-list/create-variant/components/ProductPriceNumberInput";
import BrandsModal from "./BrandsModal";
import CategoriesModal from "./CategoriesModal";
import ProductsModal from "./ProductsModal";
import UsersModal from "./UsersModal";
import FormCard from "../../../../../components/FormCard";
import GlobalLoadingOverlay from "../../../../../../components/GlobalLoadingOverlay";
import { getCurrencyLabel } from "../../../../../../../lib/helpers";

interface DiscountFormProps {
  defaultValues?: DiscountZodType;
}

const DiscountForm = ({ defaultValues }: DiscountFormProps) => {
  const searchParams = useSearchParams();
  const paramGeneration =
    (searchParams.get("type") as $Enums.CouponGenerationType) || "MANUAL";
  const [
    openedCouponModal,
    { open: openCouponModal, close: closeCouponModal },
  ] = useDisclosure(false);
  const [
    openedProductsModal,
    { open: openProductsModal, close: closeProductsModal },
  ] = useDisclosure(false);

  const [
    openedCategoriesModal,
    { open: openCategoriesModal, close: closeCategoriesModal },
  ] = useDisclosure(false);

  const [
    openedBrandsModal,
    { open: openBrandsModal, close: closeBrandsModal },
  ] = useDisclosure(false);

  const [openedUsersModal, { open: openUsersModal, close: closeUsersModal }] =
    useDisclosure(false);

  // Buy X Get Y için ayrı modal'lar
  const [
    openedBuyProductsModal,
    { open: openBuyProductsModal, close: closeBuyProductsModal },
  ] = useDisclosure(false);

  const [
    openedGetProductsModal,
    { open: openGetProductsModal, close: closeGetProductsModal },
  ] = useDisclosure(false);

  const [editingCouponIndex, setEditingCouponIndex] = useState<number | null>(
    null
  );
  const [selectedCondition, setSelectedCondition] = useState<
    "products" | "categories" | "brands"
  >("products");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<DiscountZodType>({
    resolver: zodResolver(DiscountSchema),
    defaultValues: defaultValues || {
      allowedCurrencies: ["TRY"],
      couponGeneration: paramGeneration || "MANUAL",
      translations: [
        {
          locale: "TR",
          discountTitle: "",
        },
      ],
      coupons: [],
      type: "PERCENTAGE",
      isActive: true,
      discountPercentage: 0,
      uniqueId: createId(),
      conditions: {
        allProducts: true,
        includedCategoryIds: [],
        includedProductIds: [],
        includedVariantIds: [],
        includedBrandIds: [],
        hasAmountCondition: false,
        addEndDate: false,
        addStartDate: false,
        hasQuantityCondition: false,
        onlyRegisteredUsers: true,
        endDate: null,
        startDate: null,
        allUser: true,
        usersIds: [],
        minimumAmount: null,
        maximumAmount: null,
        minimumQuantity: null,
        maximumQuantity: null,
      },
    },
  });

  const discountType = watch("type");
  const allProducts = watch("conditions.allProducts");
  const includedProductIds = watch("conditions.includedProductIds") || [];
  const includedVariantIds = watch("conditions.includedVariantIds") || [];
  const includedCategoryIds = watch("conditions.includedCategoryIds") || [];
  const includedBrandIds = watch("conditions.includedBrandIds") || [];
  const hasAmountCondition = watch("conditions.hasAmountCondition");
  const hasQuantityCondition = watch("conditions.hasQuantityCondition");
  const addEndDate = watch("conditions.addEndDate");
  const addStartDate = watch("conditions.addStartDate");
  const startDate = watch("conditions.startDate") || null;
  const endDate = watch("conditions.endDate") || null;
  const allUsers = watch("conditions.allUser");
  const includedUserIds = watch("conditions.usersIds") || [];
  const couponGeneration = watch("couponGeneration");

  // Buy X Get Y için watch'lar
  const buyXGetYConfig = watch("buyXGetYConfig");
  const buyXGetYConfigBuyProductId = buyXGetYConfig?.buyProductId || null;
  const buyXGetYConfigGetProductId = buyXGetYConfig?.getProductId || null;
  const buyXGetYConfigBuyVariantId = buyXGetYConfig?.buyVariantId || null;
  const buyXGetYConfigGetVariantId = buyXGetYConfig?.getVariantId || null;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "coupons",
  });

  const {
    control: couponControl,
    handleSubmit: handleCouponSubmit,
    reset: resetCouponForm,
    setError: setCouponError,
  } = useForm({
    resolver: zodResolver(DiscountCouponSchema),
    defaultValues: {
      code: "",
      limit: null,
      perUserLimit: null,
    },
  });

  const handleAddCoupon = () => {
    setEditingCouponIndex(null);
    resetCouponForm({
      code: "",
      limit: null,
      perUserLimit: null,
    });
    openCouponModal();
  };

  const handleEditCoupon = (index: number) => {
    setEditingCouponIndex(index);
    const coupon = fields[index];
    resetCouponForm(coupon);
    openCouponModal();
  };

  const handleSaveCoupon = (data: DiscountZodType["coupons"][number]) => {
    const codeExists = fields.some((coupon, index) => {
      return coupon.code === data.code && index !== editingCouponIndex;
    });

    if (codeExists) {
      setCouponError("code", {
        message: "Bu kupon kodu zaten mevcut.",
      });
      return;
    }
    if (editingCouponIndex !== null) {
      update(editingCouponIndex, data);
    } else {
      append(data);
    }
    closeCouponModal();
    resetCouponForm();
  };

  const handleDeleteCoupon = (index: number) => {
    remove(index);
  };

  const { push } = useRouter();

  const onSubmit: SubmitHandler<DiscountZodType> = async (data) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/discounts/create-or-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        let errorMessage = "Bilinmeyen bir hata oluştu";

        switch (response.status) {
          case 400:
            errorMessage = errorData?.message || "Gönderilen veriler geçersiz";
            break;
          case 401:
            errorMessage = "Oturum süreniz dolmuş, lütfen tekrar giriş yapın";
            break;
          case 403:
            errorMessage = "Bu işlem için yetkiniz bulunmuyor";
            break;
          case 409:
            errorMessage = errorData?.message || "Kupon kodu zaten kullanımda";
            break;
          case 422:
            errorMessage =
              "Validasyon hatası: " +
              (errorData?.message || "Veriler geçersiz");
            break;
          case 500:
            errorMessage =
              "Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin";
            break;
          default:
            errorMessage = `HTTP ${response.status}: ${errorData?.message || "Bilinmeyen hata"}`;
        }

        throw new Error(errorMessage);
      }

      notifications.show({
        color: "teal",
        title: "Başarılı!",
        message: "İndirim başarıyla kaydedildi",
        icon: <IconCheck size={16} />,
        loading: false,
        autoClose: 3000,
      });

      push("/admin/store/discounts");
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Hata!",
        message:
          error instanceof Error ? error.message : "İndirim kaydedilemedi",
        icon: <IconX size={16} />,
        loading: false,
        autoClose: 5000,
      });
    }
  };

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Stack gap={"lg"}>
        <Group justify="end">
          <Button
            variant="outline"
            onClick={() => {
              setValue("isActive", false);
              handleSubmit(onSubmit)();
            }}
          >
            Taslak Olarak Kaydet
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>Kaydet</Button>
        </Group>

        <FormCard title="Başlık">
          <Controller
            control={control}
            name="translations.0.discountTitle"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                error={fieldState.error?.message}
                label="İndirim Başlığı"
                withAsterisk
                description="Yönetim panelinde ve sipariş özetinde gösterilecektir."
              />
            )}
          />
        </FormCard>

        <FormCard title="İndirim Türü">
          <Stack gap={"md"}>
            <Controller
              control={control}
              name="type"
              render={({ field, fieldState }) => (
                <Radio.Group
                  {...field}
                  onChange={(value: $Enums.DiscountType | "BUY_X_GET_Y") => {
                    field.onChange(value);
                    if (value === "FIXED") {
                      setValue("discountPercentage", null);
                      setValue("allowedCurrencies", ["TRY"]);
                    } else if (value === "PERCENTAGE") {
                      setValue("discountAmount", null);
                      setValue("allowedCurrencies", ["TRY"]);
                    } else if (value === "FREE_SHIPPING") {
                      setValue("discountAmount", null);
                      setValue("discountPercentage", null);
                      setValue("allowedCurrencies", []);
                    } else if (value === "BUY_X_GET_Y") {
                      setValue("discountAmount", null);
                      setValue("discountPercentage", null);
                      setValue("allowedCurrencies", []);
                    }
                  }}
                  error={fieldState.error?.message}
                >
                  <SimpleGrid cols={{ xs: 1, sm: 2, md: 4 }}>
                    <Radio.Card
                      value={$Enums.DiscountType.PERCENTAGE}
                      className="border bg-[var(--mantine-color-admin-0)]"
                      p={"lg"}
                    >
                      <Group justify="space-between">
                        <Group gap={"md"}>
                          <ThemeIcon
                            variant="filled"
                            color="admin.5"
                            size={"lg"}
                            radius={"100%"}
                          >
                            <IconPercentage />
                          </ThemeIcon>
                          <Text fz="sm">Yüzdelik</Text>
                        </Group>
                        <Radio.Indicator />
                      </Group>
                    </Radio.Card>
                    <Radio.Card
                      value={$Enums.DiscountType.FIXED}
                      className="border bg-[var(--mantine-color-admin-0)]"
                      p={"lg"}
                    >
                      <Group justify="space-between">
                        <Group gap={"md"}>
                          <ThemeIcon
                            variant="filled"
                            color="admin.5"
                            size={"lg"}
                            radius={"100%"}
                          >
                            <IconCurrencyLira />
                          </ThemeIcon>
                          <Text fz="sm">Sabit Tutar</Text>
                        </Group>
                        <Radio.Indicator />
                      </Group>
                    </Radio.Card>
                    <Radio.Card
                      value={$Enums.DiscountType.FREE_SHIPPING}
                      className="border bg-[var(--mantine-color-admin-0)]"
                      p={"lg"}
                    >
                      <Group justify="space-between">
                        <Group gap={"md"}>
                          <ThemeIcon
                            variant="filled"
                            color="admin.5"
                            size={"lg"}
                            radius={"100%"}
                          >
                            <IconTruck />
                          </ThemeIcon>
                          <Text fz="sm">Ücretsiz Kargo</Text>
                        </Group>
                        <Radio.Indicator />
                      </Group>
                    </Radio.Card>
                    <Radio.Card
                      value={"BUY_X_GET_Y"}
                      className="border bg-[var(--mantine-color-admin-0)]"
                      p={"lg"}
                    >
                      <Group justify="space-between">
                        <Group gap={"md"}>
                          <ThemeIcon
                            variant="filled"
                            color="admin.5"
                            size={"lg"}
                            radius={"100%"}
                          >
                            <IconTicket />
                          </ThemeIcon>
                          <Text fz="sm">X Al Y Kazan</Text>
                        </Group>
                        <Radio.Indicator />
                      </Group>
                    </Radio.Card>
                  </SimpleGrid>
                </Radio.Group>
              )}
            />
          </Stack>
        </FormCard>

        {discountType !== "FREE_SHIPPING" && discountType !== "BUY_X_GET_Y" && (
          <FormCard title={"İndirim Bilgisi"}>
            <Stack gap={"lg"}>
              {discountType === "FIXED" ? (
                <Controller
                  control={control}
                  name="discountAmount"
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      error={fieldState.error?.message}
                      label="İndirim Tutarı"
                      min={0}
                      max={Number.MAX_SAFE_INTEGER}
                      allowDecimal={false}
                      withAsterisk
                      hideControls
                    />
                  )}
                />
              ) : (
                <Controller
                  control={control}
                  name="discountPercentage"
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      error={fieldState.error?.message}
                      label="İndirim Oranı"
                      min={0}
                      max={100}
                      allowDecimal={false}
                      withAsterisk
                      hideControls
                    />
                  )}
                />
              )}
              <Controller
                control={control}
                name="allowedCurrencies"
                render={({ field, fieldState }) => (
                  <MultiSelect
                    {...field}
                    error={fieldState.error?.message}
                    label="Geçerli Para Birimi"
                    data={Object.values($Enums.Currency).map((currency) => ({
                      value: currency,
                      label: getCurrencyLabel(currency),
                    }))}
                  />
                )}
              />
            </Stack>
          </FormCard>
        )}

        {discountType === "BUY_X_GET_Y" && (
          <Stack gap={"md"}>
            <FormCard title="Müşterinin Aldıkları">
              <Stack gap={"md"}>
                <Controller
                  control={control}
                  name="buyXGetYConfig.buyQuantity"
                  render={({ field, fieldState }) => (
                    <ProductPriceNumberInput
                      {...field}
                      error={fieldState.error?.message}
                      label="Alınacak Ürün Adedi"
                      withAsterisk
                      style={{ maxWidth: 200 }}
                    />
                  )}
                />

                <Group gap={"md"} align="end">
                  <Button variant="outline" onClick={openBuyProductsModal}>
                    {buyXGetYConfigBuyProductId || buyXGetYConfigBuyVariantId
                      ? "Seçimi Değiştir"
                      : "Ürün Seç"}
                  </Button>
                  {(buyXGetYConfigBuyProductId ||
                    buyXGetYConfigBuyVariantId) && (
                    <Text size="sm" c="blue">
                      ✓ Ürün seçildi
                    </Text>
                  )}
                </Group>
              </Stack>
            </FormCard>

            <FormCard title="Müşterinin Kazandıkları">
              <Stack gap={"md"}>
                <Group gap={"md"}>
                  <Controller
                    control={control}
                    name="buyXGetYConfig.getQuantity"
                    render={({ field, fieldState }) => (
                      <ProductPriceNumberInput
                        {...field}
                        error={fieldState.error?.message}
                        label="Kazanılacak Ürün Adedi"
                        withAsterisk
                        style={{ maxWidth: 200 }}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="buyXGetYConfig.discountPercentage"
                    render={({ field, fieldState }) => (
                      <NumberInput
                        {...field}
                        error={fieldState.error?.message}
                        label="İndirim Oranı (%)"
                        min={0}
                        max={100}
                        withAsterisk
                        hideControls
                        style={{ maxWidth: 200 }}
                      />
                    )}
                  />
                </Group>

                <Group gap={"md"} align="end">
                  <Button variant="outline" onClick={openGetProductsModal}>
                    {buyXGetYConfigGetProductId || buyXGetYConfigGetVariantId
                      ? "Seçimi Değiştir"
                      : "Ürün Seç"}
                  </Button>
                  {(buyXGetYConfigGetProductId ||
                    buyXGetYConfigGetVariantId) && (
                    <Text size="sm" c="blue">
                      ✓ Ürün seçildi
                    </Text>
                  )}
                </Group>
              </Stack>
            </FormCard>
          </Stack>
        )}

        {couponGeneration === "MANUAL" && (
          <FormCard
            title={
              <Group justify="space-between">
                <Stack gap={"xs"}>
                  <Text fw={700} fz={"lg"}>
                    Kuponlar
                  </Text>{" "}
                  {errors && errors.coupons && errors.coupons.message && (
                    <InputError>{errors.coupons.message}</InputError>
                  )}
                </Stack>

                {fields && fields.length > 0 && (
                  <Button leftSection={<IconPlus />} onClick={handleAddCoupon}>
                    Kupon Ekle
                  </Button>
                )}
              </Group>
            }
          >
            {fields.length > 0 ? (
              <SimpleGrid cols={{ xs: 1, sm: 2, md: 5 }} spacing="md">
                {fields.map((coupon, index) => (
                  <Card key={coupon.id} withBorder p="md">
                    <Stack gap="xs">
                      <Group justify="space-between" align="flex-start">
                        <Group gap={"xs"} align="center">
                          <Text fw={600} size="sm" c="admin.6">
                            {coupon.code}
                          </Text>
                          <CopyButton value={coupon.code}>
                            {({ copied, copy }) => (
                              <ActionIcon
                                size={"xs"}
                                variant="subtle"
                                color={copied ? "teal" : "blue"}
                                onClick={copy}
                              >
                                {copied ? <IconCopyCheck /> : <IconCopy />}
                              </ActionIcon>
                            )}
                          </CopyButton>
                        </Group>

                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={() => handleEditCoupon(index)}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteCoupon(index)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Stack gap={4}>
                        {coupon.limit && (
                          <Text size="xs" c="dimmed">
                            Toplam Limit: {coupon.limit}
                          </Text>
                        )}
                        {coupon.perUserLimit && (
                          <Text size="xs" c="dimmed">
                            Kullanıcı Başı: {coupon.perUserLimit}
                          </Text>
                        )}
                        {!coupon.limit && !coupon.perUserLimit && (
                          <Text size="xs" c="dimmed">
                            Sınırsız kullanım
                          </Text>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Stack gap={"lg"} align="center" py={"md"}>
                <Text fz={"lg"} fw={700} c="dimmed">
                  Henüz bir kupon eklenmedi
                </Text>
                <Button leftSection={<IconPlus />} onClick={handleAddCoupon}>
                  Kupon Ekle
                </Button>
              </Stack>
            )}
          </FormCard>
        )}

        {discountType !== "BUY_X_GET_Y" && (
          <FormCard title="Uygula">
            <Stack gap={"lg"}>
              <Controller
                control={control}
                name="conditions.allProducts"
                render={({ field, fieldState }) => (
                  <Radio.Group
                    {...field}
                    value={field.value ? "true" : "false"}
                    onChange={(value) => {
                      if (value === "true") {
                        field.onChange(true);
                        setValue("conditions.includedProductIds", []);
                        setValue("conditions.includedVariantIds", []);
                        setValue("conditions.includedCategoryIds", []);
                        setValue("conditions.includedBrandIds", []);
                      } else if (value === "false") {
                        field.onChange(false);
                      }
                    }}
                    error={fieldState.error?.message}
                  >
                    <SimpleGrid cols={2}>
                      <Radio.Card value={"true"} p={"md"} className="border">
                        <Group gap={"md"}>
                          <Radio.Indicator />
                          <Text>Tüm Ürünler</Text>
                        </Group>
                      </Radio.Card>
                      <Radio.Card value={"false"} p={"md"} className="border">
                        <Group gap={"md"}>
                          <Radio.Indicator />
                          <Text>Belirli Ürünler</Text>
                        </Group>
                      </Radio.Card>
                    </SimpleGrid>
                  </Radio.Group>
                )}
              />
              {!allProducts && (
                <Group gap={"lg"} align="center">
                  <Select
                    defaultValue="products"
                    value={selectedCondition}
                    onChange={(value) =>
                      setSelectedCondition(
                        value as "products" | "categories" | "brands"
                      )
                    }
                    data={[
                      { label: "Ürünler", value: "products" },
                      { label: "Kategoriler", value: "categories" },
                      { label: "Markalar", value: "brands" },
                    ]}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedCondition === "products") {
                        openProductsModal();
                      } else if (selectedCondition === "categories") {
                        openCategoriesModal();
                      } else if (selectedCondition === "brands") {
                        openBrandsModal();
                      }
                    }}
                  >
                    {selectedCondition === "products"
                      ? "Ürün Seç"
                      : selectedCondition === "categories"
                        ? "Kategori Seç"
                        : "Marka Seç"}
                  </Button>
                </Group>
              )}
              {!allProducts && includedProductIds.length > 0 && (
                <Text size="sm" c="dimmed">
                  {includedProductIds.length} ürün seçildi
                </Text>
              )}
              {!allProducts && includedVariantIds.length > 0 && (
                <Text size="sm" c="dimmed">
                  {includedVariantIds.length} varyant seçildi
                </Text>
              )}
              {!allProducts && includedCategoryIds.length > 0 && (
                <Text size="sm" c="dimmed">
                  {includedCategoryIds.length} kategori seçildi
                </Text>
              )}
              {!allProducts && includedBrandIds.length > 0 && (
                <Text size="sm" c="dimmed">
                  {includedBrandIds.length} marka seçildi
                </Text>
              )}
            </Stack>
          </FormCard>
        )}

        {discountType !== "BUY_X_GET_Y" && (
          <FormCard
            title={
              <Stack gap={"xs"}>
                <Title order={4}>Gereksinimler</Title>
                <InputDescription>
                  Müşteri bu indirimi kullanabilmek için aşağıdaki
                  gereksinimleri karşılamalıdır.
                </InputDescription>
                {errors && errors.conditions && (
                  <InputError>{errors.conditions.message}</InputError>
                )}
              </Stack>
            }
          >
            <Stack gap={"lg"}>
              <Card withBorder>
                <Group gap={"lg"} align="start">
                  <Controller
                    control={control}
                    name="conditions.hasAmountCondition"
                    render={({ field: { value, ...field }, fieldState }) => (
                      <Switch
                        {...field}
                        checked={value}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Stack gap={"xs"}>
                    <Title order={6}>Satın alma tutarını sınırla</Title>
                    <InputDescription>
                      Sepetteki toplam satın alma tutarına uygulancak sınırları
                      belirleyin.
                    </InputDescription>
                  </Stack>
                </Group>
                {hasAmountCondition && (
                  <>
                    <Divider my={"xs"} />
                    <SimpleGrid cols={2}>
                      <Controller
                        control={control}
                        name="conditions.minimumAmount"
                        render={({ field, fieldState }) => (
                          <NumberInput
                            {...field}
                            error={fieldState.error?.message}
                            hideControls
                            label="Maksimum Tutar"
                            min={0}
                            max={Number.MAX_SAFE_INTEGER}
                            description="Müşterinin indirimi kullanabilmesi için sepetinde bulunması gereken maksimum tutar"
                          />
                        )}
                      />
                    </SimpleGrid>
                  </>
                )}
              </Card>
              <Card withBorder>
                <Group gap={"lg"} align="start">
                  <Controller
                    control={control}
                    name="conditions.hasQuantityCondition"
                    render={({ field: { value, ...field }, fieldState }) => (
                      <Switch
                        {...field}
                        checked={value}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Stack gap={"xs"}>
                    <Title order={6}>Ürün adedini sınırla</Title>
                    <InputDescription>
                      Sepetteki toplam ürün adedine uygulanacak sınırları
                      belirleyin.
                    </InputDescription>
                  </Stack>
                </Group>
                {hasQuantityCondition && (
                  <>
                    <Divider my={"xs"} />
                    <SimpleGrid cols={2}>
                      <Controller
                        control={control}
                        name="conditions.minimumQuantity"
                        render={({ field, fieldState }) => (
                          <NumberInput
                            {...field}
                            error={fieldState.error?.message}
                            hideControls
                            onChange={(val) => {
                              field.onChange(val === "" ? null : Number(val));
                            }}
                            label="Minimum Ürün Adedi"
                            min={0}
                            max={Number.MAX_SAFE_INTEGER}
                            description="Müşterinin indirimi kullanabilmesi için sepetinde bulunması gereken minimum ürün adedi"
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="conditions.maximumQuantity"
                        render={({ field, fieldState }) => (
                          <NumberInput
                            {...field}
                            onChange={(val) => {
                              field.onChange(val === "" ? null : Number(val));
                            }}
                            error={fieldState.error?.message}
                            hideControls
                            label="Maksimum Ürün Adedi"
                            min={0}
                            max={Number.MAX_SAFE_INTEGER}
                            description="Müşterinin indirimi kullanabilmesi için sepetinde bulunması gereken maksimum ürün adedi"
                          />
                        )}
                      />
                    </SimpleGrid>
                  </>
                )}
              </Card>
            </Stack>
          </FormCard>
        )}

        <FormCard title="Kullanıcı Koşulu">
          <Stack gap={"xs"}>
            <Controller
              control={control}
              name="conditions.onlyRegisteredUsers"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  {...field}
                  checked={value}
                  error={fieldState.error?.message}
                  label="Sadece Kayıtlı Kullanıcılar"
                  classNames={{
                    label: "font-semibold",
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="conditions.allUser"
              render={({ field: { value, ...field }, fieldState }) => (
                <Switch
                  {...field}
                  checked={value}
                  error={fieldState.error?.message}
                  onChange={(event) => {
                    field.onChange(event.currentTarget.checked);
                    if (event.currentTarget.checked) {
                      setValue("conditions.usersIds", []);
                    }
                  }}
                  label="Tüm Kullanıcılar"
                  classNames={{
                    label: "font-semibold",
                  }}
                />
              )}
            />
            {!allUsers && (
              <Stack gap={"xs"} my={"sm"}>
                <Button.Group>
                  <Button variant="outline" onClick={openUsersModal}>
                    Kullanıcı Seç
                  </Button>
                </Button.Group>
                {includedUserIds.length > 0 && (
                  <Text size="sm" c="dimmed">
                    {includedUserIds.length} kullanıcı seçildi
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        </FormCard>

        <FormCard title="Aktif Tarihler">
          <Stack gap={"sm"}>
            <Card withBorder>
              <Stack gap={"xs"}>
                <Group gap="lg" align="start">
                  <Controller
                    control={control}
                    name="conditions.addStartDate"
                    render={({ field: { value, ...field }, fieldState }) => (
                      <Switch
                        {...field}
                        checked={value}
                        error={fieldState.error?.message}
                        label="Başlangıç Tarihi Ekle"
                        onChange={(event) => {
                          field.onChange(event.currentTarget.checked);
                          if (!event.currentTarget.checked) {
                            setValue("conditions.startDate", null);
                          }
                        }}
                      />
                    )}
                  />
                </Group>
                {addStartDate && (
                  <Controller
                    control={control}
                    name="conditions.startDate"
                    render={({ field, fieldState }) => (
                      <DateTimePicker
                        {...field}
                        label="Başlangıç Tarihi"
                        error={fieldState.error?.message}
                        withAsterisk
                        minDate={new Date()}
                        maxDate={endDate ? new Date(endDate) : undefined}
                      />
                    )}
                  />
                )}
              </Stack>
            </Card>
            <Card withBorder>
              <Stack gap={"xs"}>
                <Group gap="lg" align="start">
                  <Controller
                    control={control}
                    name="conditions.addEndDate"
                    render={({ field: { value, ...field }, fieldState }) => (
                      <Switch
                        {...field}
                        checked={value}
                        error={fieldState.error?.message}
                        label="Bitiş Tarihi Ekle"
                        onChange={(event) => {
                          field.onChange(event.currentTarget.checked);
                          if (!event.currentTarget.checked) {
                            setValue("conditions.endDate", null);
                          }
                        }}
                      />
                    )}
                  />
                </Group>
                {addEndDate && (
                  <Controller
                    control={control}
                    name="conditions.endDate"
                    render={({ field, fieldState }) => (
                      <DateTimePicker
                        {...field}
                        label="Bitiş Tarihi"
                        error={fieldState.error?.message}
                        withAsterisk
                        minDate={
                          addStartDate && startDate
                            ? new Date(
                                new Date(startDate).getTime() + 60 * 60 * 1000
                              ) // +1 saat
                            : undefined
                        }
                      />
                    )}
                  />
                )}
              </Stack>
            </Card>
          </Stack>
        </FormCard>
      </Stack>

      {/* Kupon Modal */}
      <Modal
        opened={openedCouponModal}
        onClose={() => {
          closeCouponModal();
          resetCouponForm();
        }}
        size="md"
        centered
        title={
          editingCouponIndex !== null ? "Kupon Düzenle" : "Yeni Kupon Ekle"
        }
      >
        <Stack gap="md">
          <Controller
            control={couponControl}
            name="code"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                onChange={(e) =>
                  field.onChange(e.currentTarget.value.toUpperCase())
                }
                label="Kupon Kodu"
                error={fieldState.error?.message}
                withAsterisk
              />
            )}
          />
          <Stack gap={"0"} mt={"xs"}>
            <Title order={4}>Limitler</Title>
            <Divider my={"xs"} />
          </Stack>
          <SimpleGrid cols={2}>
            <Controller
              control={couponControl}
              name="limit"
              render={({
                field: { value, onChange, ...field },
                fieldState,
              }) => (
                <NumberInput
                  {...field}
                  value={value || ""}
                  onChange={(val) => onChange(val === "" ? null : Number(val))}
                  label="Toplam Kullanım Limiti"
                  error={fieldState.error?.message}
                  min={0}
                  hideControls
                  description="Bu kuponun toplamda kaç kez kullanılabileceğini belirler"
                />
              )}
            />

            <Controller
              control={couponControl}
              name="perUserLimit"
              render={({
                field: { value, onChange, ...field },
                fieldState,
              }) => (
                <NumberInput
                  {...field}
                  value={value || ""}
                  onChange={(val) => onChange(val === "" ? null : Number(val))}
                  label="Kullanıcı Başına Limit"
                  hideControls
                  error={fieldState.error?.message}
                  min={0}
                  description="Her kullanıcının bu kuponu kaç kez kullanabileceğini belirler"
                />
              )}
            />
          </SimpleGrid>

          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                closeCouponModal();
                resetCouponForm();
              }}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleCouponSubmit(handleSaveCoupon)}
            >
              {editingCouponIndex !== null ? "Güncelle" : "Ekle"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Normal Ürün Seçim Modal'ı */}
      <ProductsModal
        onClose={closeProductsModal}
        opened={openedProductsModal}
        includedProductIds={includedProductIds}
        includedVariantIds={includedVariantIds}
        onSelectionChange={(productIds, variantIds) => {
          setValue("conditions.includedProductIds", productIds);
          setValue("conditions.includedVariantIds", variantIds);
        }}
      />

      {/* Kategori Modal'ı */}
      <CategoriesModal
        includedCategoryIds={includedCategoryIds}
        onClose={closeCategoriesModal}
        opened={openedCategoriesModal}
        onSelectionChange={(ids) => {
          setValue("conditions.includedCategoryIds", ids);
        }}
      />

      {/* Marka Modal'ı */}
      <BrandsModal
        includedBrandIds={includedBrandIds}
        onClose={closeBrandsModal}
        opened={openedBrandsModal}
        onSelectionChange={(ids) => {
          setValue("conditions.includedBrandIds", ids);
        }}
      />

      {/* Kullanıcı Modal'ı */}
      <UsersModal
        includedUserIds={includedUserIds}
        onClose={closeUsersModal}
        opened={openedUsersModal}
        onSelectionChange={(ids) => {
          setValue("conditions.usersIds", ids);
        }}
      />

      {/* Buy X Get Y için Ürün Seçim Modal'ları */}
      <ProductsModal
        opened={openedBuyProductsModal}
        onClose={closeBuyProductsModal}
        mode="single"
        title="Alınacak Ürün Seç"
        singleProductId={buyXGetYConfigBuyProductId}
        singleVariantId={buyXGetYConfigBuyVariantId}
        onSingleSelectionChange={(productId, variantId) => {
          setValue("buyXGetYConfig.buyProductId", productId || null);
          setValue("buyXGetYConfig.buyVariantId", variantId || null);
        }}
        includedProductIds={[]}
        includedVariantIds={[]}
      />

      <ProductsModal
        opened={openedGetProductsModal}
        onClose={closeGetProductsModal}
        mode="single"
        title="Kazanılacak Ürün Seç"
        singleProductId={buyXGetYConfigGetProductId}
        singleVariantId={buyXGetYConfigGetVariantId}
        onSingleSelectionChange={(productId, variantId) => {
          setValue("buyXGetYConfig.getProductId", productId || null);
          setValue("buyXGetYConfig.getVariantId", variantId || null);
        }}
        includedProductIds={[]}
        includedVariantIds={[]}
      />
    </>
  );
};

export default DiscountForm;
