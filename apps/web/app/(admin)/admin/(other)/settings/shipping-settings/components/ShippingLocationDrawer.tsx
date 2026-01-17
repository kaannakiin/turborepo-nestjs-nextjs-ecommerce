'use client';
import { getSelectionTextShipping } from '@lib/helpers';
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Drawer,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedState, useDisclosure } from '@mantine/hooks';
import { SubmitHandler, useForm, zodResolver } from '@repo/shared';
import { LocationSchema, LocationType } from '@repo/types';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useStates, useCities } from '@hooks/useLocations';
import Loader from '@/components/Loader';

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
  const [searchQuery, setSearchQuery] = useDebouncedState('', 300);
  const [selectedStateIds, setSelectedStateIds] = useState<string[]>([]);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);

  const {
    handleSubmit,
    watch,
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

  const stateIds = watch('stateIds') || [];
  const cityIds = watch('cityIds') || [];
  const countryType = watch('countryType');

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

  const filteredStates = states?.filter((state) =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCities = cities?.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStateToggle = (stateId: string) => {
    const newStateIds = selectedStateIds.includes(stateId)
      ? selectedStateIds.filter((id) => id !== stateId)
      : [...selectedStateIds, stateId];

    setSelectedStateIds(newStateIds);
  };

  const handleCityToggle = (cityId: string) => {
    const newCityIds = selectedCityIds.includes(cityId)
      ? selectedCityIds.filter((id) => id !== cityId)
      : [...selectedCityIds, cityId];

    setSelectedCityIds(newCityIds);
  };

  const handleModalConfirm = () => {
    if (countryType === 'STATE') {
      setValue('stateIds', selectedStateIds);
    } else if (countryType === 'CITY') {
      setValue('cityIds', selectedCityIds);
    }
    closeModal();
  };

  const handleModalCancel = () => {
    setSelectedStateIds(stateIds);
    setSelectedCityIds(cityIds);
    setSearchQuery('');
    closeModal();
  };

  const handleSave = handleSubmit(onSubmit);

  if (!defaultValues) return null;
  if (statesIsLoading || citiesIsLoading) return <Loader />;

  const data = watch();
  const isStateMode = countryType === 'STATE';
  const currentData = isStateMode ? filteredStates : filteredCities;
  const selectedItems = isStateMode ? selectedStateIds : selectedCityIds;
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
                {getSelectionTextShipping(data)}
              </Text>
            </Stack>
            {countryType !== 'NONE' && (
              <Group gap={'xs'}>
                <Button
                  variant="default"
                  onClick={() => {
                    setSelectedStateIds(stateIds);
                    setSelectedCityIds(cityIds);
                    openModal();
                  }}
                >
                  {countryType === 'CITY' ? 'Şehirleri' : 'Eyaletleri'} Sınırla
                </Button>
              </Group>
            )}
          </Group>
        </Card>
      </Drawer>

      <Modal.Root
        opened={modalOpened}
        onClose={handleModalCancel}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
        size="md"
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {isStateMode ? 'Eyalet Seçin' : 'Şehir Seçin'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Stack gap="md">
              <Group className="w-full">
                <TextInput
                  className="flex-1"
                  placeholder={`${isStateMode ? 'Eyalet' : 'Şehir'} ara...`}
                  defaultValue={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.currentTarget.value)
                  }
                  variant="filled"
                />
                {selectedItems && selectedItems.length > 0 && (
                  <ActionIcon
                    variant="transparent"
                    c={'red'}
                    onClick={() => {
                      if (isStateMode) {
                        setSelectedStateIds([]);
                      } else {
                        setSelectedCityIds([]);
                      }
                    }}
                  >
                    <IconTrash />
                  </ActionIcon>
                )}
              </Group>

              <Stack gap="xs" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {currentData?.map((item) => (
                  <Group
                    key={item.id}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                    align="center"
                    gap="md"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isStateMode) {
                        handleStateToggle(item.id);
                      } else {
                        handleCityToggle(item.id);
                      }
                    }}
                  >
                    <Checkbox
                      readOnly
                      checked={selectedItems.includes(item.id)}
                    />
                    <Text>{item.name}</Text>
                  </Group>
                ))}
              </Stack>

              <Group justify="end" gap="sm">
                <Button variant="outline" onClick={handleModalCancel}>
                  İptal
                </Button>
                <Button onClick={handleModalConfirm}>Onayla</Button>
              </Group>
            </Stack>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};

export default ShippingLocationDrawer;
