"use client";
import {
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  $Enums,
  AllowedDiscountedItemsBy,
  DiscountType,
} from "@repo/database/client";
import {
  Control,
  Controller,
  UseFieldArrayRemove,
  UseFormSetValue,
  UseFormWatch,
} from "@repo/shared";
import { CampaignZodType, ProductModalData } from "@repo/types";
import { useState } from "react";
import OverviewUppSellCard from "./OverviewUppSellCard";
import SearchableProductModal from "./SearchableProductModal";
import FormCard from "../../discounts/components/FormCard";

interface CampaignOfferFormProps {
  control: Control<CampaignZodType>;
  watch: UseFormWatch<CampaignZodType>;
  setValue: UseFormSetValue<CampaignZodType>;
  index: number;
  remove: UseFieldArrayRemove;
  excludeProductIds?: string[];
  excludeVariantIds?: string[];
}

const CampaignOfferForm = ({
  control,
  index,
  watch,
  setValue,
  remove,
  excludeProductIds,
  excludeVariantIds,
}: CampaignOfferFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [selectedProductModalData, setSelectedProductModalData] =
    useState<ProductModalData | null>(null);
  const [selectedParentData, setSelectedParentData] =
    useState<ProductModalData | null>(null);
  const selectedProduct = watch(`offers.${index}.productId`);
  const selectedVariant = watch(`offers.${index}.variantId`);
  const offer = watch(`offers.${index}`);

  return (
    <>
      <FormCard
        title={
          <Group justify="space-between" align="center">
            <Title order={4}>Teklif {index + 1}</Title>
            {index > 0 && (
              <Button
                variant="filled"
                color="red"
                onClick={() => {
                  remove(index);
                }}
              >
                Teklifi Kaldır
              </Button>
            )}
          </Group>
        }
      >
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <Stack gap="lg">
            <Card className="bg-gray-50 flex flex-col " p={"md"}>
              {selectedProductModalData ? (
                <Group gap={"xs"} justify="space-between">
                  <Text>
                    {selectedParentData
                      ? `${selectedParentData.name} > ${selectedProductModalData.name}`
                      : selectedProductModalData.name}
                  </Text>
                  <UnstyledButton onClick={open}>Düzenle</UnstyledButton>
                </Group>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    open();
                  }}
                >
                  Ürün Ekle
                </Button>
              )}
            </Card>
            <Controller
              control={control}
              name={`offers.${index}.title`}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  error={fieldState.error?.message}
                  label="Kampanya Teklif Başlığı"
                  withAsterisk
                />
              )}
            />
            <Controller
              control={control}
              name={`offers.${index}.description`}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  error={fieldState.error?.message}
                  label="Teklif Açıklaması"
                />
              )}
            />
            <Group gap={"md"} align="end">
              <Controller
                control={control}
                name={`offers.${index}.offer.discountValue`}
                render={({ field, fieldState }) => (
                  <NumberInput
                    {...field}
                    error={fieldState.error?.message}
                    label="Teklif Fiyatı"
                    withAsterisk
                    hideControls
                  />
                )}
              />
              <Controller
                control={control}
                name={`offers.${index}.offer.discountType`}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    error={fieldState.error?.message}
                    allowDeselect={false}
                    data={[
                      {
                        label: "Yüzdelik",
                        value: DiscountType.PERCENTAGE,
                      },
                      {
                        label: "Sabit Tutar",
                        value: DiscountType.FIXED_AMOUNT,
                      },
                    ]}
                  />
                )}
              />
            </Group>
            <Controller
              control={control}
              name={`offers.${index}.offer.discountValueAppliedByPrice`}
              render={({ field, fieldState }) => (
                <Radio.Group
                  {...field}
                  label="Uygulanacak Fiyat"
                  classNames={{
                    label: "font-bold",
                  }}
                  error={fieldState.error?.message}
                >
                  <SimpleGrid cols={2} py={"xs"}>
                    <Radio
                      classNames={{
                        label: "font-semibold",
                      }}
                      value={AllowedDiscountedItemsBy.discounted_price}
                      label="İndirimli Fiyat Üzerinden"
                    />
                    <Radio
                      classNames={{
                        label: "font-semibold",
                      }}
                      value={AllowedDiscountedItemsBy.price}
                      label="Normal Fiyat Üzerinden"
                    />
                  </SimpleGrid>
                </Radio.Group>
              )}
            />

            <Controller
              control={control}
              name={`offers.${index}.offer.addCountDown`}
              render={({ field: { value, ...field } }) => (
                <Switch
                  {...field}
                  classNames={{
                    label: "font-bold",
                  }}
                  checked={value}
                  label="Geri Sayım Ekle"
                />
              )}
            />
            {offer.offer.addCountDown && (
              <Controller
                control={control}
                name={`offers.${index}.offer.countDownMinute`}
                render={({ field, fieldState }) => (
                  <NumberInput
                    {...field}
                    error={fieldState.error?.message}
                    label="Geri Sayım"
                    description="Geri Sayım Süreci Dk.cinsinden belirtmelisiniz."
                  />
                )}
              />
            )}
            <Controller
              control={control}
              name={`offers.${index}.offer.showPrroductIfInCart`}
              render={({ field: { value, ...field } }) => (
                <Switch
                  {...field}
                  classNames={{
                    label: "font-bold",
                  }}
                  checked={value}
                  label="Ürün Sepette Varsa Teklifi Göster"
                />
              )}
            />
          </Stack>
          <Divider orientation="vertical" className="h-full" />
          <Stack gap="xs">
            <OverviewUppSellCard offerReq={offer} />
          </Stack>
        </div>
      </FormCard>
      <SearchableProductModal
        initialProductIds={selectedProduct ? [selectedProduct] : []}
        initialVariantIds={selectedVariant ? [selectedVariant] : []}
        onCancel={() => {
          close();
        }}
        multiple={false}
        opened={opened}
        onConfirm={(productIds, variantIds, products) => {
          if (productIds.length > 0) {
            const selectedId = productIds[0];
            const selectedProduct = products.find((p) => p.id === selectedId);

            if (selectedProduct) {
              setValue(`offers.${index}.productId`, selectedId);
              setValue(`offers.${index}.variantId`, null);
              setSelectedProductModalData(selectedProduct);
              setSelectedParentData(null);
            }
            close();
            return;
          }
          if (variantIds.length > 0) {
            const selectedId = variantIds[0];
            let selectedVariantData: ProductModalData | null = null;
            let parentProductData: ProductModalData | null = null;

            for (const product of products) {
              if (product.sub) {
                const found = product.sub.find((sub) => sub.id === selectedId);
                if (found) {
                  selectedVariantData = found;
                  parentProductData = product;
                  break;
                }
              }
            }

            if (selectedVariantData && parentProductData) {
              setValue(`offers.${index}.productId`, null);
              setValue(`offers.${index}.variantId`, selectedId);

              setSelectedProductModalData(selectedVariantData);
              setSelectedParentData(parentProductData);
            }
            close();
            return;
          }

          setValue(`offers.${index}.productId`, null);
          setValue(`offers.${index}.variantId`, null);
          setSelectedProductModalData(null);
          setSelectedParentData(null); // Parent'ı da temizle
          close();
        }}
        excludeProductIds={excludeProductIds}
        excludeVariantIds={excludeVariantIds}
      />
    </>
  );
};

export default CampaignOfferForm;
