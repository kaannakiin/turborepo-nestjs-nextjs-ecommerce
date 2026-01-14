/* eslint-disable react/no-unescaped-entities */
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay';
import {
  useStoreGetQuery,
  useStoreUpsertMutation,
} from '@hooks/admin/useStore';
import {
  getLocaleLabel,
  getRoutingStrategyDescription,
  getRoutingStrategyLabel,
} from '@lib/helpers';
import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Paper,
  Radio,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { Currency, Locale, RoutingStrategy } from '@repo/database/client';
import {
  Control,
  Controller,
  getCurrencyFullLabel,
  SubmitHandler,
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
  UseFormSetValue,
  useWatch,
  zodResolver,
} from '@repo/shared';
import {
  StoreZodInputType,
  StoreZodOutputType,
  StoreZodSchema,
} from '@repo/types';
import {
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconWorldWww,
} from '@tabler/icons-react';
import classes from './radioCard.module.css';
import { useEffect } from 'react';

interface LocaleCurrencyTableProps {
  data: UseFieldArrayReturn<
    StoreZodInputType,
    'b2cLocaleCurrencies' | 'b2bLocaleCurrencies',
    'fieldId'
  >;
  control: Control<StoreZodInputType>;
  fieldName: 'b2cLocaleCurrencies' | 'b2bLocaleCurrencies';
  defaultLocaleFieldName: 'b2cDefaultLocale' | 'b2bDefaultLocale';
  setValue: UseFormSetValue<StoreZodInputType>;
}

const LocaleCurrencyTable = ({
  data,
  control,
  fieldName,
  defaultLocaleFieldName,
  setValue,
}: LocaleCurrencyTableProps) => {
  const { fields, append, remove } = data;

  const defaultLocale = useWatch({
    control,
    name: defaultLocaleFieldName,
  });

  return (
    <Stack gap="xs">
      <Group justify="end">
        <Button
          leftSection={<IconPlus size={18} />}
          variant="outline"
          size="sm"
          disabled={fields.length >= Object.keys(Locale).length}
          onClick={() => {
            const availableLocales = Object.keys(Locale).filter((locale) => {
              return !fields.some((field) => field.locale === locale);
            });
            if (availableLocales.length === 0) return;
            append({
              locale: availableLocales[0] as Locale,
              currency: Object.keys(Currency)[
                Math.floor(Math.random() * Object.keys(Currency).length)
              ] as Currency,
            });
            if (fields.length === 0) {
              setValue(defaultLocaleFieldName, availableLocales[0] as Locale);
            }
          }}
        >
          Dil Ekle
        </Button>
      </Group>
      <Table.ScrollContainer minWidth={800}>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={80}>Varsayılan</Table.Th>
              <Table.Th>Dil</Table.Th>
              <Table.Th>Para Birimi</Table.Th>
              <Table.Th w={60} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {fields?.length > 0 ? (
              fields.map((field, index) => (
                <Table.Tr key={field.fieldId}>
                  <Table.Td>
                    <Controller
                      control={control}
                      name={defaultLocaleFieldName}
                      render={({ field: controllerField }) => (
                        <Checkbox
                          checked={controllerField.value === field.locale}
                          onChange={() =>
                            controllerField.onChange(field.locale)
                          }
                        />
                      )}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>{getLocaleLabel(field.locale)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Controller
                      control={control}
                      name={`${fieldName}.${index}.currency`}
                      render={({ field, fieldState }) => (
                        <Select
                          {...field}
                          error={fieldState.error?.message}
                          data={Object.keys(Currency).map((curr) => ({
                            value: curr,
                            label: getCurrencyFullLabel(curr as Currency),
                          }))}
                          allowDeselect={false}
                          size="sm"
                        />
                      )}
                    />
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => {
                        if (
                          defaultLocale === field.locale &&
                          fields.length > 1
                        ) {
                          const remainingFields = fields.filter(
                            (_, i) => i !== index,
                          );
                          setValue(
                            defaultLocaleFieldName,
                            remainingFields[0].locale,
                          );
                        }
                        remove(index);
                      }}
                      disabled={fields.length === 1}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center" py="md">
                    Henüz dil eklenmedi
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
};

const StoreSettingsForm = () => {
  const { mutateAsync, isPending } = useStoreUpsertMutation();
  const { data, isLoading } = useStoreGetQuery();
  const { control, handleSubmit, formState, setValue, reset } =
    useForm<StoreZodInputType>({
      resolver: zodResolver(StoreZodSchema),
      defaultValues: {
        name: '',
        isB2CActive: true,
        b2cCustomDomain: '',
        b2cRouting: 'PATH_PREFIX',
        b2cDefaultLocale: 'TR',
        b2cLocaleCurrencies: [
          {
            locale: 'TR',
            currency: 'TRY',
          },
        ],
        isB2BActive: false,
        b2bSubdomain: '',
        b2bCustomDomain: '',
        b2bRouting: 'PATH_PREFIX',
        b2bDefaultLocale: 'TR',
        b2bLocaleCurrencies: [],
      },
    });

  const isB2bActive = useWatch({
    control,
    name: 'isB2BActive',
  });

  const isB2CActive = useWatch({
    control,
    name: 'isB2CActive',
  });

  const b2bSubdomain = useWatch({
    control,
    name: 'b2bSubdomain',
  });

  const b2bCustomDomain = useWatch({
    control,
    name: 'b2bCustomDomain',
  });

  const b2cCustomDomain = useWatch({
    control,
    name: 'b2cCustomDomain',
  });

  const b2cRouting = useWatch({
    control,
    name: 'b2cRouting',
  });

  const b2bRouting = useWatch({
    control,
    name: 'b2bRouting',
  });

  const b2cFields = useFieldArray({
    control,
    name: 'b2cLocaleCurrencies',
    keyName: 'fieldId',
  });

  const b2bFields = useFieldArray({
    control,
    name: 'b2bLocaleCurrencies',
    keyName: 'fieldId',
  });

  const isB2bSubdomainRoutingDisabled =
    isB2bActive && b2bSubdomain && !b2bCustomDomain;

  const showB2bRoutingWarning =
    isB2bActive &&
    b2bSubdomain &&
    !b2bCustomDomain &&
    b2bRouting === 'SUBDOMAIN';

  const showDomainConflictWarning = () => {
    if (!isB2CActive || !isB2bActive || !b2cCustomDomain || !b2bCustomDomain) {
      return null;
    }

    const extractBaseDomain = (domain: string) => {
      const parts = domain.toLowerCase().split('.');
      if (parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
      return domain.toLowerCase();
    };

    const b2cBase = extractBaseDomain(b2cCustomDomain);
    const b2bBase = extractBaseDomain(b2bCustomDomain);

    if (b2cBase !== b2bBase) return null;

    const b2cSubdomainPart = b2cCustomDomain
      .toLowerCase()
      .replace(`.${b2cBase}`, '');
    const b2bSubdomainPart = b2bCustomDomain
      .toLowerCase()
      .replace(`.${b2bBase}`, '');

    if (b2cRouting === 'SUBDOMAIN') {
      return (
        <Alert
          icon={<IconAlertCircle size={18} />}
          title="Dikkat: Alan Adı Çakışması"
          color="orange"
          variant="light"
        >
          B2C için subdomain routing kullanıyorsunuz. B2B subdomain'i (
          {b2bSubdomainPart}) B2C dil kodlarıyla çakışmamalıdır.
        </Alert>
      );
    }

    if (b2bRouting === 'SUBDOMAIN') {
      return (
        <Alert
          icon={<IconAlertCircle size={18} />}
          title="Dikkat: Alan Adı Çakışması"
          color="orange"
          variant="light"
        >
          B2B için subdomain routing kullanıyorsunuz. B2C subdomain'i (
          {b2cSubdomainPart}) B2B dil kodlarıyla çakışmamalıdır.
        </Alert>
      );
    }

    return null;
  };
  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit: SubmitHandler<StoreZodOutputType> = (data) => {
    mutateAsync(data);
  };

  return (
    <>
      {isLoading || isPending ? <GlobalLoadingOverlay /> : null}

      <Stack gap="md">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              label="Organizasyon Adı"
              withAsterisk
              size="md"
            />
          )}
        />

        <Paper bg="gray.0" p="md" radius="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fz="lg" fw={700}>
                B2C
              </Text>
              <Controller
                control={control}
                name="isB2CActive"
                render={({ field: { value, ...field }, fieldState }) => (
                  <Switch
                    checked={value}
                    {...field}
                    error={fieldState.error?.message}
                    label="Aktif"
                  />
                )}
              />
            </Group>
            <Collapse in={isB2CActive}>
              <Divider my="xs" />
              <Stack gap="md">
                <Controller
                  control={control}
                  name="b2cCustomDomain"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      leftSection={<IconWorldWww size={18} />}
                      error={fieldState.error?.message}
                      label="B2C Alan Adı"
                      placeholder="ornek.com"
                      size="sm"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="b2cRouting"
                  render={({ field, fieldState }) => (
                    <Radio.Group
                      {...field}
                      label="Dil Yönlendirme Stratejisi"
                      description="Çok dilli içerik için URL yapısını belirler"
                      error={fieldState.error?.message}
                    >
                      <Stack gap="xs" mt="xs">
                        {Object.values(RoutingStrategy).map((strategy) => (
                          <Radio.Card
                            className={classes.root}
                            key={strategy}
                            value={strategy}
                            radius="md"
                          >
                            <Group wrap="nowrap" align="flex-start">
                              <Radio.Indicator />
                              <div>
                                <Text className={classes.label}>
                                  {getRoutingStrategyLabel(strategy)}
                                </Text>
                                <Text className={classes.description}>
                                  {getRoutingStrategyDescription(strategy)}
                                </Text>
                              </div>
                            </Group>
                          </Radio.Card>
                        ))}
                      </Stack>
                    </Radio.Group>
                  )}
                />

                <Divider
                  label="Desteklenen Diller ve Para Birimleri"
                  labelPosition="left"
                />
                <LocaleCurrencyTable
                  data={b2cFields}
                  control={control}
                  fieldName="b2cLocaleCurrencies"
                  defaultLocaleFieldName="b2cDefaultLocale"
                  setValue={setValue}
                />
              </Stack>
            </Collapse>
          </Stack>
        </Paper>

        <Paper bg="gray.0" p="md" radius="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fz="lg" fw={700}>
                B2B
              </Text>
              <Controller
                control={control}
                name="isB2BActive"
                render={({ field: { value, ...field }, fieldState }) => (
                  <Switch
                    checked={value}
                    {...field}
                    error={fieldState.error?.message}
                    label="Aktif"
                  />
                )}
              />
            </Group>
            <Collapse in={isB2bActive}>
              <Divider my="xs" />
              <Stack gap="md">
                {!b2bCustomDomain && b2bSubdomain && (
                  <Alert
                    icon={<IconAlertCircle size={18} />}
                    title="Bilgilendirme"
                    color="blue"
                    variant="light"
                  >
                    Platform subdomain kullanıyorsunuz ({b2bSubdomain}.
                    {b2cCustomDomain || 'domain.com'}). Bu durumda dil ayrımı
                    için sadece "Path Prefix" stratejisi kullanılabilir.
                  </Alert>
                )}

                {showB2bRoutingWarning && (
                  <Alert
                    icon={<IconAlertCircle size={18} />}
                    title="Hata: Geçersiz Routing Stratejisi"
                    color="red"
                  >
                    Platform subdomain kullanırken dil ayrımı için 'Subdomain'
                    stratejisi kullanılamaz. Lütfen 'Path Prefix' seçiniz veya
                    özel bir alan adı (Custom Domain) tanımlayınız.
                  </Alert>
                )}

                {showDomainConflictWarning()}

                <Controller
                  control={control}
                  name="b2bSubdomain"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      error={fieldState.error?.message}
                      label="B2B Subdomain"
                      placeholder="b2b"
                      size="sm"
                      description={
                        b2cCustomDomain
                          ? `${field.value || 'subdomain'}.${b2cCustomDomain} şeklinde erişilecek`
                          : 'Ana domain tanımlandıktan sonra oluşturulacak'
                      }
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="b2bCustomDomain"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      leftSection={<IconWorldWww size={18} />}
                      error={fieldState.error?.message}
                      label="B2B Özel Alan Adı (İsteğe Bağlı)"
                      placeholder="bayi.ornek.com"
                      size="sm"
                      description="Subdomain yerine özel bir alan adı kullanmak isterseniz"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="b2bRouting"
                  render={({ field, fieldState }) => (
                    <Radio.Group
                      {...field}
                      label="Dil Yönlendirme Stratejisi"
                      description="Çok dilli içerik için URL yapısını belirler"
                      error={fieldState.error?.message}
                    >
                      <Stack gap="xs" mt="xs">
                        {Object.values(RoutingStrategy).map((strategy) => (
                          <Radio.Card
                            key={strategy}
                            value={strategy}
                            className={classes.root}
                            radius="md"
                            disabled={
                              strategy === 'SUBDOMAIN' &&
                              isB2bSubdomainRoutingDisabled
                            }
                          >
                            <Group wrap="nowrap" align="flex-start">
                              <Radio.Indicator />
                              <div>
                                <Text className={classes.label}>
                                  {getRoutingStrategyLabel(strategy)}
                                </Text>
                                <Text className={classes.description}>
                                  {getRoutingStrategyDescription(strategy)}
                                </Text>
                                {strategy === 'SUBDOMAIN' &&
                                  isB2bSubdomainRoutingDisabled && (
                                    <Text size="xs" c="red" mt={4}>
                                      Platform subdomain kullanırken bu seçenek
                                      kullanılamaz
                                    </Text>
                                  )}
                              </div>
                            </Group>
                          </Radio.Card>
                        ))}
                      </Stack>
                    </Radio.Group>
                  )}
                />

                <Divider
                  label="Desteklenen Diller ve Para Birimleri"
                  labelPosition="left"
                />
                <LocaleCurrencyTable
                  data={b2bFields}
                  control={control}
                  fieldName="b2bLocaleCurrencies"
                  defaultLocaleFieldName="b2bDefaultLocale"
                  setValue={setValue}
                />
              </Stack>
            </Collapse>
          </Stack>
        </Paper>
        <Group justify="end">
          <Button onClick={handleSubmit(onSubmit)} size="md" variant="light">
            Kaydet
          </Button>
        </Group>
      </Stack>
    </>
  );
};

export default StoreSettingsForm;
