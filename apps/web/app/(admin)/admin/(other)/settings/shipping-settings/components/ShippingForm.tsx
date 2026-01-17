'use client';

import ActionPopover from '@/(admin)/components/ActionPopover';
import PriceFormatter from '@/(user)/components/PriceFormatter';
import LoadingOverlay from '@/components/LoadingOverlay';
import CountryModal from '@/components/modals/CountryModal';
import { useCreateOrUpdateCargoZone } from '@hooks/admin/useShipping';
import { useCountries } from '@hooks/useLocations';
import { getConditionText, getSelectionTextShipping } from '@lib/helpers';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
  zodResolver,
} from '@repo/shared';
import {
  CargoZoneConfigSchema,
  CargoZoneType,
  LocationType,
} from '@repo/types';
import { IconEdit, IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ShippingLocationDrawer from './ShippingLocationDrawer';
import ShippingRuleModal from './ShippingRuleModal';

interface ShippingFormProps {
  defaultValues?: CargoZoneType;
}

const ShippingForm = ({ defaultValues }: ShippingFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure();
  const [editingLocationIndex, setEditingLocationIndex] = useState<
    number | null
  >(null);
  const [openedRuleModal, { open: openRuleModal, close: closeRuleModal }] =
    useDisclosure();
  const [editingRule, setEditingRule] = useState<number | null>(null);
  const handleEditLocation = (index: number) => {
    setEditingLocationIndex(index);
    openDrawer();
  };

  const handleCloseDrawer = () => {
    closeDrawer();
    // Wait for animation to complete before clearing index
    setTimeout(() => setEditingLocationIndex(null), 300);
  };

  const handleUpdateLocation = (updatedLocation: LocationType) => {
    if (editingLocationIndex !== null) {
      updateLocation(editingLocationIndex, updatedLocation);
    }
    handleCloseDrawer();
  };

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<CargoZoneType>({
    resolver: zodResolver(CargoZoneConfigSchema),
    defaultValues: defaultValues || {
      uniqueId: null,
      locations: [],
      rules: [],
    },
  });

  const {
    fields: locationFields,
    append: appendLocation,
    update: updateLocation,
    remove: removeLocation,
  } = useFieldArray({
    control,
    name: 'locations',
  });

  const {
    fields: ruleFields,
    append: appendRule,
    update: updateRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: 'rules',
  });

  const { data: countries, isLoading: countriesIsLoading } = useCountries({
    refetchOnMount: false,
  });

  const locations = useWatch({
    control,
    name: 'locations',
  });

  const { push } = useRouter();

  const { mutateAsync: createOrUpdateZone } = useCreateOrUpdateCargoZone();

  const onSubmit: SubmitHandler<CargoZoneType> = async (
    data: CargoZoneType,
  ) => {
    try {
      await createOrUpdateZone(data, {
        onSuccess: () => {
          notifications.show({
            title: 'Başarılı',
            message: 'Bölge kaydedildi',
            color: 'green',
          });
          push('/admin/settings/shipping-settings');
        },
        onError: (data, variables) => {
          notifications.show({
            title: 'Hata',
            message: data?.message || 'Bölge kaydedilirken bir hata oluştu',
            color: 'red',
          });
        },
      });
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: 'Bölge kaydedilirken bir hata oluştu',
        color: 'red',
      });
    }
  };

  return (
    <>
      {isSubmitting && <LoadingOverlay />}
      <div className="flex flex-col gap-5">
        <Group justify="end">
          <Button onClick={handleSubmit(onSubmit)}>Kaydet</Button>
        </Group>
        <Alert
          icon={<IconInfoCircle />}
          variant="outline"
          title="Bilgilendirme"
        >
          Kural setinde seçeceğiniz para birimleri, bölgeye özel olarak
          ayarlanacaktır. Eğer bir bölge için para birimi seçilmezse, o bölgeye
          gönderim sağlanmayacaktır.
        </Alert>
        <Card p={'xs'} withBorder>
          <Card.Section className="border-b border-b-gray-400">
            <Group justify="space-between" p={'md'}>
              <Stack gap={'xs'}>
                <Title order={4}>Bölgeler</Title>
                {errors.locations && (
                  <Text c={'red'} size="sm">
                    {errors.locations.message}
                  </Text>
                )}
              </Stack>
              {locationFields && locationFields.length > 0 && (
                <Button onClick={open} disabled={countriesIsLoading}>
                  Bölge Düzenle
                </Button>
              )}
            </Group>
          </Card.Section>
          <div className="flex-1 flex flex-col ">
            {locationFields && locationFields.length > 0 ? (
              <ScrollArea py="sm" mah={500} className="flex flex-col gap-3">
                {locationFields.map((location, index) => {
                  const country = countries?.find(
                    (c) => c.id === location.countryId,
                  );
                  if (!country) return null;
                  return (
                    <Group
                      key={location.countryId}
                      justify="space-between"
                      className="hover:bg-gray-100 transition-colors duration-200 ease-in-out px-3 py-2 rounded"
                      align="center"
                    >
                      <Group gap={'xs'}>
                        <Stack gap={'xs'}>
                          <Text>{country.translations[0].name}</Text>
                          <Text c={'dimmed'} fz={'sm'}>
                            {getSelectionTextShipping(location)}
                          </Text>
                        </Stack>
                      </Group>
                      <Group align="center" gap={'md'} justify="end">
                        {location.countryType !== 'NONE' && (
                          <ActionIcon
                            onClick={() => {
                              handleEditLocation(index);
                            }}
                            variant="transparent"
                            size={'xs'}
                          >
                            <IconEdit />
                          </ActionIcon>
                        )}
                        <ActionPopover
                          targetIcon={<IconTrash />}
                          onConfirm={() => removeLocation(index)}
                          text="Bu bölgeyi silmek istediğinize emin misiniz?"
                        />
                      </Group>
                    </Group>
                  );
                })}
              </ScrollArea>
            ) : (
              <div className="flex flex-col gap-3 items-center justify-center py-5">
                <Text>Hiçbir bölge eklenmedi</Text>
                <Button onClick={open}>Bölge Ekle</Button>
              </div>
            )}
          </div>
        </Card>

        <Card p={'xs'} withBorder>
          <Card.Section className="border-b border-b-gray-400">
            <Group justify="space-between" p={'md'}>
              <Stack gap={'xs'}>
                <Title order={4}>Kurallar</Title>
                {errors.rules && (
                  <Text c={'red'} size="sm">
                    {errors.rules.message}
                  </Text>
                )}
              </Stack>
              {ruleFields && ruleFields.length > 0 && (
                <Button
                  onClick={() => {
                    setEditingRule(null);
                    openRuleModal();
                  }}
                >
                  Kural Ekle
                </Button>
              )}
            </Group>
          </Card.Section>
          <div className="flex-1 flex flex-col ">
            {ruleFields && ruleFields.length > 0 ? (
              <ScrollArea py="sm" mah={500} className="space-y-2">
                {ruleFields.map((rule, index) => (
                  <Group
                    className="hover:bg-gray-100 transition-colors duration-200 ease-in-out px-3 py-2 rounded"
                    key={rule.id}
                    justify="space-between"
                    mb={index === ruleFields.length - 1 ? 0 : 'xs'}
                    align="center"
                  >
                    <Stack gap={'xs'}>
                      <Group fz={'md'} c={'black'}>
                        <Text>{rule.name}</Text>
                        {rule.shippingPrice > 0 ? (
                          <Group gap={'1px'} wrap="nowrap" align="center">
                            <PriceFormatter
                              fz={'xs'}
                              price={rule.shippingPrice}
                              currency={rule.currency}
                            />
                            <Text fz={'xs'}> - Kargo Ücreti</Text>
                          </Group>
                        ) : (
                          <Text fz={'xs'}>Ücretsiz Kargo</Text>
                        )}
                      </Group>
                      <Text fz={'md'} c={'dimmed'}>
                        {getConditionText(rule)}
                      </Text>
                    </Stack>
                    <Group>
                      <ActionIcon
                        variant="transparent"
                        size={'xs'}
                        onClick={() => {
                          setEditingRule(index);
                          openRuleModal();
                        }}
                      >
                        <IconEdit />
                      </ActionIcon>
                      <ActionPopover
                        targetIcon={<IconTrash color="red" />}
                        text="Bu kuralı silmek istediğinize emin misiniz ?"
                        onConfirm={() => removeRule(index)}
                      />
                    </Group>
                  </Group>
                ))}
              </ScrollArea>
            ) : (
              <div className="flex flex-col gap-3 items-center justify-center py-5">
                <Text>Hiçbir kural eklenmedi</Text>
                <Button onClick={openRuleModal}>Kural Ekle</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      <CountryModal
        opened={opened}
        onClose={close}
        selectedIds={locations.map((l) => l.countryId)}
        onSubmit={(selectedCountries) => {
          const indexesToRemove: number[] = [];
          locations.forEach((loc, index) => {
            if (!selectedCountries.some((c) => c.id === loc.countryId)) {
              indexesToRemove.push(index);
            }
          });
          indexesToRemove
            .sort((a, b) => b - a)
            .forEach((index) => removeLocation(index));
          selectedCountries.forEach((country) => {
            if (!locations.find((loc) => loc.countryId === country.id)) {
              appendLocation({
                countryId: country.id,
                countryType: country.type,
                stateIds: country.type === 'STATE' ? [] : null,
                cityIds: country.type === 'CITY' ? [] : null,
              });
            }
          });
        }}
      />
      <ShippingRuleModal
        closeRuleModal={() => {
          setEditingRule(null);
          closeRuleModal();
        }}
        openedRuleModal={openedRuleModal}
        defaultValues={
          ruleFields.find((_, i) => i === editingRule) || undefined
        }
        onSubmit={(data) => {
          const isExists = ruleFields.findIndex(
            (rule) => rule.uniqueId === data.uniqueId,
          );
          if (isExists !== -1) {
            updateRule(isExists, data);
          } else {
            appendRule(data);
          }
          closeRuleModal();
        }}
      />
      {editingLocationIndex !== null &&
        locationFields[editingLocationIndex] && (
          <ShippingLocationDrawer
            opened={drawerOpened}
            onClose={handleCloseDrawer}
            defaultValues={locationFields[editingLocationIndex]}
            countryName={
              countries?.find(
                (c) => c.id === locationFields[editingLocationIndex].countryId,
              )?.translations[0].name || ''
            }
            onSubmit={handleUpdateLocation}
          />
        )}
    </>
  );
};

export default ShippingForm;
