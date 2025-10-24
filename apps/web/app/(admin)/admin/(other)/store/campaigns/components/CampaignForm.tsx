"use client";
import ActionPopover from "@/(admin)/components/ActionPopoverr";
import FormCard from "@/(admin)/components/FormCard";
import { getCurrencyLabel } from "@lib/helpers";
import {
  Alert,
  Button,
  Group,
  InputDescription,
  MultiSelect,
  NumberInput,
  Paper,
  Radio,
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
import { $Enums } from "@repo/database";
import {
  Controller,
  dateFns,
  useFieldArray,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  CampaignOfferType,
  CampaignZodSchema,
  CampaignZodType,
  ProductModalData,
  UpSellCampaignDefaultValues,
} from "@repo/types";
import {
  IconCaretUpFilled,
  IconInfoCircle,
  IconPlus,
  IconRouteX,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
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

const CampaignForm = ({ defaultValues }: CampaignFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [modalProducts, setModalProducts] = useState<ProductModalData[]>([]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
    reset,
  } = useForm<CampaignZodType>({
    resolver: zodResolver(CampaignZodSchema),
    defaultValues: defaultValues || UpSellCampaignDefaultValues,
  });

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
  const title = watch("title");

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

  const { fields, update, append, remove } = useFieldArray({
    control,
    name: "offers",
  });

  return (
    <>
      <Stack gap={"md"} className="max-w-5xl w-full lg:mx-auto ">
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
                    onChange={(e) => {
                      field.onChange(e as CampaignOfferType);
                    }}
                    error={fieldState.error?.message}
                  >
                    <SimpleGrid cols={2}>
                      <Radio.Card
                        value={CampaignOfferType.UP_SELLING}
                        className={`border p-4 rounded-xl ${
                          field.value === CampaignOfferType.UP_SELLING
                            ? "border-2 border-[var(--mantine-primary-color-5)] bg-[var(--mantine-primary-color-light)]"
                            : "border border-gray-400 bg-white"
                        }`}
                      >
                        <Group justify="space-between" align="center">
                          <Group gap={"md"}>
                            <ThemeIcon
                              variant={
                                field.value === CampaignOfferType.UP_SELLING
                                  ? "light"
                                  : "transparent"
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
                        value={CampaignOfferType.CROSS_SELLING}
                        className={`border p-4 rounded-xl ${
                          field.value === CampaignOfferType.CROSS_SELLING
                            ? "border-2 border-[var(--mantine-primary-color-5)] bg-[var(--mantine-primary-color-light)]"
                            : "border border-gray-400 bg-white"
                        }`}
                      >
                        <Group justify="space-between" align="center">
                          <Group gap={"md"}>
                            <ThemeIcon
                              variant={
                                field.value === CampaignOfferType.CROSS_SELLING
                                  ? "light"
                                  : "transparent"
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

                  {field.value === CampaignOfferType.UP_SELLING && (
                    <Alert
                      icon={<IconInfoCircle size={16} />}
                      title="Up Sell Kampanyası"
                      color="blue"
                    >
                      Bu kampanya sadece ödeme sayfasında (checkout)
                      görünecektir.
                    </Alert>
                  )}

                  {field.value === CampaignOfferType.CROSS_SELLING && (
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
        {type === CampaignOfferType.UP_SELLING && (
          <>
            <FormCard
              title={
                <Group align="center" justify="space-between">
                  <Title order={4}>Satın Alınması Gereken Ürünler</Title>
                  <Button variant="outline" onClick={open}>
                    Ürün Düzenle
                  </Button>
                </Group>
              }
            >
              {selectedProducts.length > 0 ? (
                <Stack gap="md">
                  {selectedProducts.map((product) => (
                    <Paper
                      key={product.id}
                      withBorder
                      p={"md"}
                      radius={"md"}
                      shadow="sm"
                    >
                      <Group gap={"md"} align="center" justify="space-between">
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
              ) : (
                <div className="flex flex-col min-h-20 items-center justify-center gap-3">
                  <Text>
                    Henüz bir ürün eklenmedi. Kampanyanın aktif olabilmesi için
                    en az bir ürün eklemeniz gerekmektedir.
                  </Text>
                  <Button variant="outline" onClick={open}>
                    Ürün Ekle
                  </Button>
                </div>
              )}
            </FormCard>
            {fields && fields.length > 0 && (
              <FormCard
                title="Teklifler"
                classNames={{
                  root: "bg-gray-50",
                }}
              >
                <Stack gap={"md"}>
                  {fields.map((field, index) => (
                    <CampaignOfferForm
                      control={control}
                      key={field.id}
                      index={index}
                      watch={watch}
                      remove={remove}
                      setValue={setValue}
                    />
                  ))}
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
          </>
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
                    data={Object.values($Enums.Currency).map((curr) => ({
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
    </>
  );
};

export default CampaignForm;
