"use client";
import ActionPopover from "@/(admin)/components/ActionPopoverr";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { getCampaignStatusLabel, getCurrencyLabel } from "@lib/helpers";
import {
  Alert,
  Button,
  Group,
  InputDescription,
  InputError,
  MultiSelect,
  NumberInput,
  Paper,
  Radio,
  ScrollArea,
  SegmentedControl,
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
import { CampaignStatus, CampaignType, Currency } from "@repo/database/client";
import {
  Controller,
  dateFns,
  FieldErrors,
  SubmitHandler,
  useFieldArray,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  CampaignZodSchema,
  CampaignZodType,
  CrossSellingCampaignDefaultValues,
  CrossSellingCampaignType,
  ProductModalData,
  UpSellCampaignDefaultValues,
  UpSellingCampaignType,
} from "@repo/types";
import {
  IconCaretUpFilled,
  IconFilter,
  IconInfoCircle,
  IconPackage,
  IconPlus,
  IconRouteX,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormCard from "../../discounts/components/FormCard";
import CampaignOfferForm from "./CampaignOfferForm";
import SearchableProductModal from "./SearchableProductModal";

interface CampaignFormProps {
  defaultValues?: CampaignZodType;
}

interface SelectedProduct {
  id: string;
  displayName: string;
  isVariant: boolean;
}

const calculateDisplayProducts = (
  productIds: string[],
  variantIds: string[],
  products: ProductModalData[]
): SelectedProduct[] => {
  const displayProducts: SelectedProduct[] = [];

  products.forEach((product) => {
    if (product.sub && product.sub.length > 0) {
      const selectedSubs = product.sub.filter((sub) =>
        variantIds.includes(sub.id)
      );

      if (selectedSubs.length === product.sub.length) {
        displayProducts.push({
          id: product.id,
          displayName: product.name,
          isVariant: false,
        });
      } else {
        selectedSubs.forEach((sub) => {
          displayProducts.push({
            id: sub.id,
            displayName: `${product.name} > ${sub.name}`,
            isVariant: true,
          });
        });
      }
    } else if (productIds.includes(product.id)) {
      displayProducts.push({
        id: product.id,
        displayName: product.name,
        isVariant: false,
      });
    }
  });

  return displayProducts;
};

const CampaignForm = ({ defaultValues }: CampaignFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [openedCrossSell, { open: openCrossSell, close: closeCrossSell }] =
    useDisclosure();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [modalProducts, setModalProducts] = useState<ProductModalData[]>([]);

  const [selectedCrossSellProducts, setSelectedCrossSellProducts] = useState<
    SelectedProduct[]
  >([]);
  const [modalCrossSellProducts, setModalCrossSellProducts] = useState<
    ProductModalData[]
  >([]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
    reset,
    getValues,
  } = useForm<CampaignZodType>({
    resolver: zodResolver(CampaignZodSchema),
    defaultValues: defaultValues || UpSellCampaignDefaultValues,
  });

  const allOffers = watch("offers");
  const type = watch("type");
  const buyableProducts = watch("buyableProducts");
  const addMaxCartAmount = watch("requirements.addMaxCartAmount");
  const addMinCartAmount = watch("requirements.addMinCartAmount");
  const minCartAmount = watch("requirements.minCartAmount");
  const maxCartAmount = watch("requirements.maxCartAmount");
  const addStartDate = watch("dates.addStartDate");
  const addEndDate = watch("dates.addEndDate");
  const startDate = watch("dates.startDate");
  const endDate = watch("dates.endDate");
  const isAllProducts = watch("conditions.isAllProducts");
  const crossSellProductIds = watch("conditions.productIds");
  const crossSellVariantIds = watch("conditions.variantIds");

  const handleModalConfirm = (
    productIds: string[],
    variantIds: string[],
    products: ProductModalData[]
  ) => {
    setValue("buyableProducts", {
      productIds,
      variantIds,
    });

    const displayProducts = calculateDisplayProducts(
      productIds,
      variantIds,
      products
    );
    setSelectedProducts(displayProducts);

    setModalProducts(products);

    close();
  };

  const handleModalCancel = () => {
    close();
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "offers",
  });

  const { push } = useRouter();

  const onSubmit: SubmitHandler<CampaignZodType> = async (data) => {
    const response = await fetchWrapper.post<{
      success: boolean;
      message: string;
    }>(`/admin/campaigns/create-or-update-campaign`, data);

    if (!response.success) {
      const errorResponse = response as ApiError;
      notifications.show({
        title: "Hata",
        message: errorResponse.error,
        color: "red",
      });
      return;
    }
    const { success, message } = response.data;
    if (success) {
      notifications.show({
        title: "Başarılı",
        message,
        color: "green",
      });
      return;
    }
    notifications.show({
      title: "Hata",
      message,
      color: "red",
    });
    push("/admin/store/campaigns");
  };

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Stack gap={"md"} className="max-w-5xl w-full lg:mx-auto ">
        <Group justify="space-between">
          <Title order={3}>
            Kampanya {defaultValues ? "Düzenle" : "Oluştur"}
          </Title>
          <Group align="end" gap={"md"}>
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-[2px]">
                  <SegmentedControl
                    {...field}
                    radius="xl"
                    size="sm"
                    data={Object.values(CampaignStatus).map((value) => ({
                      value,
                      label: getCampaignStatusLabel(value),
                    }))}
                  />
                  {fieldState.error?.message && (
                    <InputError>{fieldState.error?.message}</InputError>
                  )}
                </div>
              )}
            />
            <Button variant="outline" onClick={handleSubmit(onSubmit)}>
              {defaultValues ? "Güncelle" : "Oluştur"}
            </Button>
          </Group>
        </Group>
        <FormCard title="Başlık">
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                error={fieldState.error?.message}
                label="Kampanya Başlığı"
                withAsterisk
              />
            )}
          />
        </FormCard>
        <FormCard title="İndirim Kurgusu">
          <Stack gap="md">
            <Controller
              control={control}
              name="type"
              render={({ field, fieldState }) => (
                <>
                  <Radio.Group
                    {...field}
                    onChange={(newType) => {
                      const currentValues = getValues();
                      const commonData = {
                        title: currentValues.title,
                        currencies: currentValues.currencies,
                        dates: currentValues.dates,
                        requirements: currentValues.requirements,
                        offers: currentValues.offers,
                      };

                      if (newType === CampaignType.UP_SELLING) {
                        reset({
                          ...UpSellCampaignDefaultValues,
                          ...commonData,
                          type: CampaignType.UP_SELLING,
                        });
                      } else if (newType === CampaignType.CROSS_SELLING) {
                        reset({
                          ...CrossSellingCampaignDefaultValues,
                          ...commonData,
                          type: CampaignType.CROSS_SELLING,
                        });
                      }
                    }}
                    error={fieldState.error?.message}
                  >
                    <SimpleGrid cols={2}>
                      <Radio.Card
                        value={CampaignType.UP_SELLING}
                        className={`border p-4 rounded-xl ${
                          field.value === CampaignType.UP_SELLING
                            ? "border-2 border-[var(--mantine-primary-color-5)] bg-[var(--mantine-primary-color-light)]"
                            : "border border-gray-400 bg-white"
                        }`}
                      >
                        <Group justify="space-between" align="center">
                          <Group gap={"md"}>
                            <ThemeIcon
                              variant={
                                field.value === CampaignType.UP_SELLING
                                  ? "filled"
                                  : "light"
                              }
                              size={"lg"}
                            >
                              <IconCaretUpFilled />
                            </ThemeIcon>
                            <Text fz={"md"}>Up Sell</Text>
                          </Group>
                          <Radio.Indicator />
                        </Group>
                      </Radio.Card>

                      <Radio.Card
                        value={CampaignType.CROSS_SELLING}
                        className={`border p-4 rounded-xl ${
                          field.value === CampaignType.CROSS_SELLING
                            ? "border-2 border-[var(--mantine-primary-color-5)] bg-[var(--mantine-primary-color-light)]"
                            : "border border-gray-400 bg-white"
                        }`}
                      >
                        <Group justify="space-between" align="center">
                          <Group gap={"md"}>
                            <ThemeIcon
                              variant={
                                field.value === CampaignType.CROSS_SELLING
                                  ? "filled"
                                  : "light"
                              }
                              size={"lg"}
                            >
                              <IconRouteX />
                            </ThemeIcon>
                            <Text fz={"md"}>Cross Sell</Text>
                          </Group>
                          <Radio.Indicator />
                        </Group>
                      </Radio.Card>
                    </SimpleGrid>
                  </Radio.Group>

                  {field.value === CampaignType.UP_SELLING && (
                    <Alert
                      icon={<IconInfoCircle size={16} />}
                      title="Up Sell Kampanyası"
                      color="blue"
                    >
                      Bu kampanya sadece ödeme sayfasında (checkout)
                      görünecektir.
                    </Alert>
                  )}

                  {field.value === CampaignType.CROSS_SELLING && (
                    <Alert
                      icon={<IconInfoCircle size={16} />}
                      title="Cross Sell Kampanyası"
                      color="blue"
                    >
                      Bu kampanya ödeme sayfası, ödeme sonrası ve ürün
                      sayfalarında gösterebilirsiniz.
                    </Alert>
                  )}
                </>
              )}
            />
          </Stack>
        </FormCard>
        {type === CampaignType.UP_SELLING ? (
          <>
            <FormCard
              title={
                <div className="flex flex-col gap-1 w-full">
                  <Group align="center" justify="space-between">
                    <Title order={4}>Satın Alınması Gereken Ürünler</Title>
                    <Button variant="outline" onClick={open}>
                      Ürün Düzenle
                    </Button>
                  </Group>
                  {errors &&
                    (errors as FieldErrors<UpSellingCampaignType>)
                      ?.buyableProducts && (
                      <InputError>
                        {
                          (errors as FieldErrors<UpSellingCampaignType>)
                            ?.buyableProducts.productIds?.message
                        }
                      </InputError>
                    )}
                </div>
              }
            >
              {selectedProducts.length > 0 ? (
                <ScrollArea h={400}>
                  <Stack gap="md" px={"md"}>
                    {selectedProducts.map((product) => (
                      <Paper
                        key={product.id}
                        withBorder
                        p={"md"}
                        radius={"md"}
                        shadow="sm"
                      >
                        <Group
                          gap={"md"}
                          align="center"
                          justify="space-between"
                        >
                          <Text fz={"md"} fw={700}>
                            {product.displayName}
                          </Text>
                          <ActionPopover
                            targetIcon={<IconTrash />}
                            text="Silmek istediğinize emin misiniz ? Bu olay geri alınamaz"
                            size="lg"
                            variant="transparent"
                            onConfirm={() => {
                              const originalProductData = modalProducts.find(
                                (p) => p.id === product.id
                              );

                              if (product.isVariant) {
                                setValue("buyableProducts", {
                                  ...buyableProducts,
                                  variantIds: buyableProducts.variantIds.filter(
                                    (id) => id !== product.id
                                  ),
                                });
                              } else if (
                                originalProductData &&
                                originalProductData.sub &&
                                originalProductData.sub.length > 0
                              ) {
                                const variantIdsToRemove =
                                  originalProductData.sub.map((s) => s.id);

                                setValue("buyableProducts", {
                                  ...buyableProducts,
                                  variantIds: buyableProducts.variantIds.filter(
                                    (id) => !variantIdsToRemove.includes(id)
                                  ),
                                });
                              } else {
                                setValue("buyableProducts", {
                                  ...buyableProducts,
                                  productIds: buyableProducts.productIds.filter(
                                    (id) => id !== product.id
                                  ),
                                });
                              }

                              setSelectedProducts((prev) =>
                                prev.filter((p) => p.id !== product.id)
                              );
                            }}
                          />
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              ) : (
                <div className="flex flex-col min-h-20 py-8 items-center justify-center gap-3">
                  <Text>Henüz bir ürün eklenmedi.</Text>
                  <Text>
                    Kampanyanın aktif olabilmesi için en az bir ürün eklemeniz
                    gerekmektedir.
                  </Text>
                  <Button variant="outline" onClick={open}>
                    Ürün Ekle
                  </Button>
                </div>
              )}
            </FormCard>
          </>
        ) : (
          <>
            <FormCard title="Koşullar">
              <Controller
                control={control}
                name="conditions.isAllProducts"
                render={({ field, fieldState }) => (
                  <Radio.Group
                    {...field}
                    error={fieldState.error?.message}
                    value={field.value ? "all" : "specific"}
                    onChange={(value) => {
                      const newValue = value === "all";
                      field.onChange(newValue);

                      if (newValue) {
                        setValue("conditions.productIds", null);
                        setValue("conditions.variantIds", null);
                      }
                    }}
                  >
                    <SimpleGrid cols={{ base: 1, md: 4 }}>
                      <Radio.Card
                        className={`border border-gray-400 rounded-xl ${
                          field.value
                            ? "bg-[var(--mantine-primary-color-1)]"
                            : ""
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
                          !field.value
                            ? "bg-[var(--mantine-primary-color-1)]"
                            : ""
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

              {!isAllProducts && (
                <Stack gap={"xs"} py={"md"}>
                  <Group gap={"md"}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        openCrossSell();
                      }}
                    >
                      Ürün Seç
                    </Button>
                  </Group>
                  {errors &&
                    (errors as FieldErrors<CrossSellingCampaignType>)
                      ?.conditions && (
                      <InputError>
                        {
                          (errors as FieldErrors<CrossSellingCampaignType>)
                            ?.conditions?.message
                        }
                      </InputError>
                    )}
                  {selectedCrossSellProducts.length > 0 ? (
                    <ScrollArea h={400}>
                      <Stack gap="md" px={"md"} pt="md">
                        {selectedCrossSellProducts.map((product) => (
                          <Paper
                            key={product.id}
                            withBorder
                            p={"md"}
                            radius={"md"}
                            shadow="sm"
                          >
                            <Group
                              gap={"md"}
                              align="center"
                              justify="space-between"
                            >
                              <Text fz={"md"} fw={700}>
                                {product.displayName}
                              </Text>
                              <ActionPopover
                                targetIcon={<IconTrash />}
                                text="Silmek istediğinize emin misiniz ? Bu olay geri alınamaz"
                                size="lg"
                                variant="transparent"
                                onConfirm={() => {
                                  const originalProductData =
                                    modalCrossSellProducts.find(
                                      (p) => p.id === product.id
                                    );

                                  if (product.isVariant) {
                                    setValue(
                                      "conditions.variantIds",
                                      (crossSellVariantIds || []).filter(
                                        (id) => id !== product.id
                                      )
                                    );
                                  } else if (
                                    originalProductData &&
                                    originalProductData.sub &&
                                    originalProductData.sub.length > 0
                                  ) {
                                    const variantIdsToRemove =
                                      originalProductData.sub.map((s) => s.id);

                                    setValue(
                                      "conditions.variantIds",
                                      (crossSellVariantIds || []).filter(
                                        (id) => !variantIdsToRemove.includes(id)
                                      )
                                    );
                                  } else {
                                    setValue(
                                      "conditions.productIds",
                                      (crossSellProductIds || []).filter(
                                        (id) => id !== product.id
                                      )
                                    );
                                  }

                                  setSelectedCrossSellProducts((prev) =>
                                    prev.filter((p) => p.id !== product.id)
                                  );
                                }}
                              />
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea>
                  ) : (
                    <Text pt="sm" c="dimmed">
                      Kampanyanın geçerli olacağı belirli ürünler seçilmedi.
                    </Text>
                  )}
                </Stack>
              )}
            </FormCard>
          </>
        )}
        {fields && fields.length > 0 && (
          <FormCard
            title="Teklifler"
            classNames={{
              root: "bg-gray-50",
            }}
          >
            <Stack gap={"md"}>
              {fields.map((field, index) => {
                const excludeProductIds = allOffers
                  ?.filter((_, i) => i !== index)
                  .map((offer) => offer.productId)
                  .filter(Boolean) as string[] | undefined;

                const excludeVariantIds = allOffers
                  ?.filter((_, i) => i !== index)
                  .map((offer) => offer.variantId)
                  .filter(Boolean) as string[] | undefined;
                return (
                  <CampaignOfferForm
                    control={control}
                    key={field.id}
                    index={index}
                    watch={watch}
                    remove={remove}
                    setValue={setValue}
                    excludeProductIds={excludeProductIds}
                    excludeVariantIds={excludeVariantIds}
                  />
                );
              })}
              <Group justify="center" align="center">
                <Button
                  leftSection={<IconPlus />}
                  onClick={() => {
                    append({
                      order: fields.length + 1,
                      description: "",
                      offer: {
                        ...UpSellCampaignDefaultValues.offers[0].offer,
                      },
                      productId: null,
                      title: "",
                      variantId: null,
                    });
                  }}
                  variant="light"
                >
                  Alternatif Teklif Ekle
                </Button>
              </Group>
            </Stack>
          </FormCard>
        )}
        <FormCard
          title={
            <Stack gap={"xs"}>
              <Title order={4}>Gereksinimler</Title>
              <InputDescription>
                Kampanya teklifi, müşteri sepetinde aşağıdaki şartları
                sağladığında uygulanacaktır.
              </InputDescription>
            </Stack>
          }
        >
          <Stack gap={"md"}>
            <Group gap={"md"} align="flex-start">
              <Controller
                control={control}
                name="requirements.addMinCartAmount"
                render={({ field: { value, ...field }, fieldState }) => (
                  <Switch
                    checked={value}
                    {...field}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.currentTarget.checked) {
                        setValue("requirements.minCartAmount", null);
                      }
                    }}
                    error={fieldState.error?.message}
                    mt="xs"
                  />
                )}
              />
              <Stack gap={"xs"} style={{ flex: 1 }}>
                <div className="flex flex-col ">
                  <Text fz="md" fw={500}>
                    Minimum Sepet Tutarı Şartı Ekle
                  </Text>
                  <Text fz="sm" c="dimmed">
                    Kampanyanın uygulanabilmesi için müşterinin sepet tutarının
                    belirlenen tutardan yüksek veya eşit olması gerekmektedir.
                  </Text>
                </div>
                {addMinCartAmount && (
                  <Group gap={"md"}>
                    <Controller
                      control={control}
                      name="requirements.minCartAmount"
                      render={({ field, fieldState }) => (
                        <NumberInput
                          {...field}
                          error={fieldState.error?.message}
                          hideControls
                          min={0}
                          max={maxCartAmount || Number.MAX_SAFE_INTEGER}
                          allowNegative={false}
                          allowDecimal={false}
                          label="Minimum Sepet Tutarı"
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
                name="requirements.addMaxCartAmount"
                render={({ field: { value, ...field }, fieldState }) => (
                  <Switch
                    checked={value}
                    {...field}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.currentTarget.checked) {
                        setValue("requirements.maxCartAmount", null);
                      }
                    }}
                    error={fieldState.error?.message}
                    mt="xs"
                  />
                )}
              />
              <Stack gap={"xs"} style={{ flex: 1 }}>
                <div className="flex flex-col ">
                  <Text fz="md" fw={500}>
                    Maksimum Sepet Tutarı Şartı Ekle
                  </Text>
                  <Text fz="sm" c="dimmed">
                    Kampanyanın uygulanabilmesi için müşterinin sepet tutarının
                    belirlenen tutardan düşük gerekmektedir.
                  </Text>
                </div>
                {addMaxCartAmount && (
                  <Group gap={"md"}>
                    <Controller
                      control={control}
                      name="requirements.maxCartAmount"
                      render={({ field, fieldState }) => (
                        <NumberInput
                          {...field}
                          error={fieldState.error?.message}
                          hideControls
                          min={minCartAmount || 0}
                          max={Number.MAX_SAFE_INTEGER}
                          allowNegative={false}
                          allowDecimal={false}
                          label="Maksimum Sepet Tutarı"
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
                name="dates.addStartDate"
                render={({ field: { value, ...field }, fieldState }) => (
                  <Switch
                    checked={value}
                    {...field}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.currentTarget.checked) {
                        setValue("dates.startDate", null);
                      }
                    }}
                    error={fieldState.error?.message}
                    mt="xs"
                  />
                )}
              />
              <Stack gap={"xs"} style={{ flex: 1 }}>
                <div className="flex flex-col ">
                  <Text fz="md" fw={500}>
                    Başlangıç Tarihi Ekle
                  </Text>
                  <Text fz="sm" c="dimmed">
                    Kampanyanın belirtilen tarihten itibaren aktif olmasını
                    sağlar.
                  </Text>
                </div>
                {addStartDate && (
                  <Group gap={"md"}>
                    <Controller
                      control={control}
                      name="dates.startDate"
                      render={({
                        field: { onChange, onBlur, value, ref },
                        fieldState,
                      }) => (
                        <DateTimePicker
                          value={value ? new Date(value) : null}
                          onChange={(date) => {
                            if (date) {
                              const formattedDate = dateFns.format(
                                date,
                                "yyyy-MM-dd HH:mm:ss"
                              );
                              onChange(formattedDate);
                            } else {
                              onChange(null);
                            }
                          }}
                          minDate={new Date()}
                          onBlur={onBlur}
                          clearable
                          ref={ref}
                          maxDate={endDate ? new Date(endDate) : undefined}
                          className="min-w-[200px] "
                          error={fieldState.error?.message}
                          label="Başlangıç Tarihi"
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
                name="dates.addEndDate"
                render={({ field: { value, ...field }, fieldState }) => (
                  <Switch
                    checked={value}
                    {...field}
                    onChange={(value) => {
                      field.onChange(value);
                      if (!value.currentTarget.checked) {
                        setValue("dates.endDate", null);
                      }
                    }}
                    error={fieldState.error?.message}
                    mt="xs"
                  />
                )}
              />
              <Stack gap={"xs"} style={{ flex: 1 }}>
                <div className="flex flex-col ">
                  <Text fz="md" fw={500}>
                    Bitiş Tarihi Ekle
                  </Text>
                  <Text fz="sm" c="dimmed">
                    Kampanyanın belirtilen tarihte sona ermesini sağlar.
                  </Text>
                </div>
                {addEndDate && (
                  <Group gap={"md"}>
                    <Controller
                      control={control}
                      name="dates.endDate"
                      render={({
                        field: { onChange, onBlur, value, ref },
                        fieldState,
                      }) => (
                        <DateTimePicker
                          value={value ? new Date(value) : null}
                          onChange={(date) => {
                            if (date) {
                              const formattedDate = dateFns.format(
                                date,
                                "yyyy-MM-dd HH:mm:ss"
                              );
                              onChange(formattedDate);
                            } else {
                              onChange(null);
                            }
                          }}
                          clearable
                          onBlur={onBlur}
                          ref={ref}
                          minDate={
                            startDate
                              ? dateFns.addMinutes(new Date(startDate), 5)
                              : undefined
                          }
                          className="min-w-[200px] "
                          valueFormat="DD/MM/YYYY HH:mm"
                          error={fieldState.error?.message}
                          label="Bitiş Tarihi"
                        />
                      )}
                    />
                  </Group>
                )}
              </Stack>
            </Group>

            <SimpleGrid cols={2}>
              <Controller
                control={control}
                name="currencies"
                render={({ field, fieldState }) => (
                  <MultiSelect
                    {...field}
                    error={fieldState.error?.message}
                    label="Para Birimleri"
                    data={Object.values(Currency).map((curr) => ({
                      label: getCurrencyLabel(curr),
                      value: curr,
                    }))}
                  />
                )}
              />
            </SimpleGrid>
          </Stack>
        </FormCard>
      </Stack>
      <SearchableProductModal
        opened={opened}
        initialProductIds={buyableProducts?.productIds || []}
        initialVariantIds={buyableProducts?.variantIds || []}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
      <SearchableProductModal
        opened={openedCrossSell}
        initialProductIds={crossSellProductIds || []}
        initialVariantIds={crossSellVariantIds || []}
        onConfirm={(productIds, variantIds, productModalData) => {
          setValue("conditions.productIds", productIds);
          setValue("conditions.variantIds", variantIds);
          const displayProducts = calculateDisplayProducts(
            productIds,
            variantIds,
            productModalData
          );
          setSelectedCrossSellProducts(displayProducts);
          setModalCrossSellProducts(productModalData);

          closeCrossSell();
        }}
        onCancel={() => {
          closeCrossSell();
        }}
      />
    </>
  );
};

export default CampaignForm;
