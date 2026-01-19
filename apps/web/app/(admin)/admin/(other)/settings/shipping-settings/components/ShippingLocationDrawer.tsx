'use client';
import { getSelectionTextShipping } from '@lib/helpers';
import { Button, Card, Drawer, Group, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { SubmitHandler, useForm, useWatch, zodResolver } from '@repo/shared';
import { LocationSchema, LocationType } from '@repo/types';
import { useStates, useCities } from '@hooks/useLocations';
import Loader from '@/components/Loader';
import { DataSelectModal } from '@repo/ui/modals';

interface ShippingLocationDrawerProps {
  defaultValues: LocationType;
  countryName: string;
  opened: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<LocationType>;
}

const ShippingLocationDrawer = ({
  defaultValues,
  onClose,
  onSubmit,
  opened,
  countryName,
}: ShippingLocationDrawerProps) => {
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LocationType>({
    resolver: zodResolver(LocationSchema),
    defaultValues: defaultValues || {
      countryId: '',
      countryType: 'NONE',
      stateIds: [],
      cityIds: [],
    },
  });

  const stateIds =
    useWatch({
      control,
      name: 'stateIds',
    }) || [];

  const cityIds =
    useWatch({
      control,
      name: 'cityIds',
    }) || [];

  const countryType = useWatch({
    control,
    name: 'countryType',
  });

  const formData = useWatch({ control });

  const { data: states, isLoading: statesIsLoading } = useStates({
    countryId: defaultValues.countryId,
    addressType: 'STATE',
    enabled: !!defaultValues.countryId && defaultValues.countryType === 'STATE',
  });

  const { data: cities, isLoading: citiesIsLoading } = useCities({
    countryId: defaultValues.countryId,
    addressType: 'CITY',
    enabled: !!defaultValues.countryId && defaultValues.countryType === 'CITY',
  });

  const handleSave = handleSubmit(onSubmit);

  if (!defaultValues) return null;
  if (statesIsLoading || citiesIsLoading) return <Loader />;

  const isStateMode = countryType === 'STATE';
  const currentItems = isStateMode ? states : cities;
  const currentSelectedIds = isStateMode ? stateIds : cityIds;

  return (
    <>
      <Drawer
        onClose={onClose}
        opened={opened}
        position="bottom"
        size={'xl'}
        withCloseButton={false}
        classNames={{
          title: 'w-full flex justify-end',
        }}
        title={
          <Group gap={'sm'}>
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </Group>
        }
      >
        <Card p={'xs'} withBorder>
          <Card.Section className="border-b border-b-gray-400">
            <Group justify="space-between" p={'md'}>
              <Title order={4}>Teslimat Bölgesi</Title>
            </Group>
          </Card.Section>
          <Group py={'md'} className="w-full" justify="space-between">
            <Stack gap="xs">
              <Text fz={'md'} fw={700}>
                {countryName}
              </Text>
              <Text fz={'sm'} c="dimmed">
                {getSelectionTextShipping(formData as LocationType)}
              </Text>
            </Stack>
            {countryType !== 'NONE' && (
              <Group gap={'xs'}>
                <Button variant="default" onClick={openModal}>
                  {countryType === 'CITY' ? 'Şehirleri' : 'Eyaletleri'} Sınırla
                </Button>
              </Group>
            )}
          </Group>
        </Card>
      </Drawer>

      <DataSelectModal
        opened={modalOpened}
        onClose={closeModal}
        title={isStateMode ? 'Eyalet Seçin' : 'Şehir Seçin'}
        searchPlaceholder={`${isStateMode ? 'Eyalet' : 'Şehir'} ara...`}
        data={currentItems || []}
        isLoading={isStateMode ? statesIsLoading : citiesIsLoading}
        selectedIds={currentSelectedIds}
        idKey="id"
        labelKey="name"
        searchKeys={['name']}
        onSubmit={(selectedItems) => {
          const selectedIds = selectedItems.map((item) => item.id);
          if (isStateMode) {
            setValue('stateIds', selectedIds);
          } else {
            setValue('cityIds', selectedIds);
          }
          closeModal();
        }}
        renderItem={(item) => <Text>{item.name}</Text>}
      />
    </>
  );
};

export default ShippingLocationDrawer;
