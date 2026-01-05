"use client";

import FormCard from "@/components/cards/FormCard";
import LabelWithTooltip from "@/components/inputs/LabelWithTooltip";
import { getFulfillmentStrategyTypeLabel } from "@lib/helpers";
import {
  Collapse,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Textarea,
  TextInput,
  Paper,
  Divider,
  Text,
} from "@mantine/core";
import { Controller, useForm, zodResolver } from "@repo/shared";
import {
  FulfillmentStrategyInput,
  FulfillmentStrategyType,
  FulfillmentStrategyZodSchema,
} from "@repo/types";

interface InventoryRuleFormProps {
  defaultValues?: FulfillmentStrategyInput;
}

const InventoryRuleForm = ({ defaultValues }: InventoryRuleFormProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<FulfillmentStrategyInput>({
    resolver: zodResolver(FulfillmentStrategyZodSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      isActive: true,
      isDefault: false,
      type: FulfillmentStrategyType.PROXIMITY,
      priority: 0,
      settings: {
        allowSplitShipment: false,
        maxSplitCount: 2,
        allowBackorder: false,
        allowDropship: false,
        defaultLeadTimeDays: 1,
        processOnHolidays: false,
      },
    },
  });

  const allowSplitShipment = watch("settings.allowSplitShipment");

  return (
    <Stack gap="lg">
      <FormCard title="Genel Bilgiler">
        <Stack gap="md">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Strateji Adı"
                placeholder="Örn: Yakınlık Bazlı Yönlendirme"
                error={errors.name?.message}
                withAsterisk
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                label="Açıklama"
                placeholder="Bu stratejinin kullanım amacı ve detayları..."
                minRows={3}
                error={errors.description?.message}
              />
            )}
          />

          <Divider my="xs" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Controller
              control={control}
              name="type"
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  error={fieldState.error?.message}
                  label={
                    <LabelWithTooltip
                      label="Strateji Algoritması"
                      tooltip="Birden fazla depo uygun olduğunda seçimi neye göre yapacağını belirler."
                    />
                  }
                  data={Object.keys(FulfillmentStrategyType).map((key) => ({
                    value: key,
                    label: getFulfillmentStrategyTypeLabel(
                      key as FulfillmentStrategyType
                    ),
                  }))}
                  allowDeselect={false}
                />
              )}
            />

            <Controller
              control={control}
              name="priority"
              render={({ field, fieldState }) => (
                <NumberInput
                  {...field}
                  error={fieldState.error?.message}
                  label={
                    <LabelWithTooltip
                      label="Öncelik Seviyesi"
                      tooltip="Çakışma durumunda yüksek puanlı kural önce çalışır."
                    />
                  }
                  placeholder="0"
                  min={0}
                  max={9999}
                  hideControls
                />
              )}
            />
          </SimpleGrid>

          <Divider my="xs" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <Controller
              name="isActive"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Paper p="md" withBorder radius="md">
                  <Switch
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label="Strateji Aktif"
                    description="Kuralı geçici olarak devre dışı bırakır"
                    size="md"
                  />
                </Paper>
              )}
            />

            <Controller
              name="isDefault"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <Paper p="md" withBorder radius="md">
                  <Switch
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label="Varsayılan Strateji"
                    description="Diğer kurallar eşleşmezse bu çalışır"
                    size="md"
                  />
                </Paper>
              )}
            />
          </SimpleGrid>
        </Stack>
      </FormCard>

      <FormCard title="Operasyonel Kurallar">
        <Stack gap="lg">
          <Paper p="md" withBorder radius="md">
            <Stack gap="md">
              <Controller
                name="settings.allowSplitShipment"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Switch
                    {...field}
                    checked={value}
                    onChange={(event) => onChange(event.currentTarget.checked)}
                    label={
                      <Text size="sm" fw={500}>
                        Parçalı Gönderime İzin Ver (Split Shipment)
                      </Text>
                    }
                    description="Sipariş tek bir depodan çıkmıyorsa, ürünlerin farklı depolardan bölünerek gönderilmesine izin verilir"
                    size="md"
                  />
                )}
              />

              <Collapse in={allowSplitShipment}>
                <Controller
                  control={control}
                  name="settings.maxSplitCount"
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      label="Maksimum Bölünme Sayısı"
                      description="Bir sipariş en fazla kaç farklı depodan gönderilebilir?"
                      min={2}
                      max={10}
                      error={fieldState.error?.message}
                      placeholder="2"
                      style={{ maxWidth: 280 }}
                    />
                  )}
                />
              </Collapse>
            </Stack>
          </Paper>

          <Stack gap="md">
            <Text size="sm" fw={600} c="dimmed">
              Stok Yönetimi
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Controller
                name="settings.allowBackorder"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Paper p="md" withBorder radius="md">
                    <Switch
                      {...field}
                      checked={value}
                      onChange={(event) =>
                        onChange(event.currentTarget.checked)
                      }
                      label={
                        <Text size="sm" fw={500}>
                          Stokta Yoksa Sat (Backorder)
                        </Text>
                      }
                      description="Ürün hiçbir depoda yoksa bile sipariş alınır ve tedarik süreci başlar"
                      size="md"
                    />
                  </Paper>
                )}
              />

              <Controller
                name="settings.allowDropship"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Paper p="md" withBorder radius="md">
                    <Switch
                      {...field}
                      checked={value}
                      onChange={(event) =>
                        onChange(event.currentTarget.checked)
                      }
                      label={
                        <Text size="sm" fw={500}>
                          Dropshipping Kullan
                        </Text>
                      }
                      description="Stok yetersizse tedarikçi entegrasyonu üzerinden doğrudan gönderim yapılır"
                      size="md"
                    />
                  </Paper>
                )}
              />
            </SimpleGrid>
          </Stack>

          <Divider />

          <Stack gap="md">
            <Text size="sm" fw={600} c="dimmed">
              İşlem Kuralları
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Controller
                name="settings.processOnHolidays"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Paper p="md" withBorder radius="md">
                    <Switch
                      {...field}
                      checked={value}
                      onChange={(event) =>
                        onChange(event.currentTarget.checked)
                      }
                      label="Resmi Tatillerde İşle"
                      description="Tatil günlerinde de sipariş yönlendirmesi yapılsın mı?"
                      size="md"
                    />
                  </Paper>
                )}
              />

              <Controller
                control={control}
                name="settings.defaultLeadTimeDays"
                render={({ field, fieldState }) => (
                  <NumberInput
                    {...field}
                    label={
                      <LabelWithTooltip
                        label="Varsayılan Hazırlık Süresi (Gün)"
                        tooltip="Bu kural setinden çıkan siparişler için operasyonel hazırlık süresi ekler."
                      />
                    }
                    description="Siparişin hazırlanması için gereken süre"
                    min={0}
                    max={30}
                    placeholder="0"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </SimpleGrid>
          </Stack>
        </Stack>
      </FormCard>
    </Stack>
  );
};

export default InventoryRuleForm;
