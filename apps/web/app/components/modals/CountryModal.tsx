'use client';

import { useCountries } from '@hooks/useLocations';
import {
  Button,
  Checkbox,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { GetAllCountryReturnType } from '@repo/types';
import { useEffect, useState } from 'react';
import Loader from '../Loader';

interface CountryModalProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  selectedIds: string[];
  onSubmit: (countries: GetAllCountryReturnType[]) => void;
}

const CountryModal = ({
  opened,
  onClose,
  title = 'Bölge Ekle',
  selectedIds,
  onSubmit,
}: CountryModalProps) => {
  const [searchQuery, setSearchQuery] = useDebouncedState<string>('', 500);
  const [localSelectedIds, setLocalSelectedIds] =
    useState<string[]>(selectedIds);

  useEffect(() => {
    if (opened) {
      setLocalSelectedIds(selectedIds);
    }
  }, [opened, selectedIds]);

  const { data: countries, isLoading } = useCountries({
    refetchOnMount: false,
    enabled: opened,
  });

  const filteredCountries =
    searchQuery.trim() !== ''
      ? countries?.filter((country) =>
          country.translations[0].name
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase()),
        )
      : countries;

  const handleToggle = (id: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    if (!countries) return;
    const selectedCountries = countries.filter((c) =>
      localSelectedIds.includes(c.id),
    );
    onSubmit(selectedCountries);
    onClose();
  };

  return (
    <Modal.Root
      opened={opened}
      classNames={{
        title: 'text-lg font-medium',
        header: 'border-b border-b-gray-500',
        body: 'py-0 max-h-[70vh]',
      }}
      centered
      size="lg"
      onClose={() => {
        onClose();
        setSearchQuery('');
      }}
    >
      <Modal.Overlay transitionProps={{ transition: 'scale', duration: 300 }} />
      <Modal.Content>
        <Modal.Header className="flex flex-col gap-3">
          <Group justify="space-between" className="w-full">
            <Modal.Title>{title}</Modal.Title>
            <Modal.CloseButton />
          </Group>
          <TextInput
            placeholder="Bölge adı"
            className="w-full"
            variant="filled"
            defaultValue={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
        </Modal.Header>
        <Modal.Body className="py-4">
          <Stack gap={'lg'}>
            {isLoading ? (
              <Loader />
            ) : (
              <ScrollArea h={400} type="always">
                <Stack gap="xs">
                  {filteredCountries &&
                    filteredCountries.length > 0 &&
                    filteredCountries.map((country) => (
                      <Group
                        className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                        key={country.id}
                        align="center"
                        gap={'lg'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggle(country.id);
                        }}
                      >
                        <Checkbox
                          readOnly
                          checked={localSelectedIds.includes(country.id)}
                        />
                        <Text>
                          {country.emoji} {country.translations[0].name}
                        </Text>
                      </Group>
                    ))}
                  {(!filteredCountries || filteredCountries.length === 0) && (
                    <Text ta="center" c="dimmed">
                      Sonuç bulunamadı
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        </Modal.Body>
        <Group
          p="md"
          justify={localSelectedIds.length > 0 ? 'space-between' : 'end'}
          className="border-t border-gray-300"
        >
          {localSelectedIds.length > 0 && (
            <Button
              variant="subtle"
              color="red"
              onClick={() => setLocalSelectedIds([])}
            >
              Tümünü Temizle
            </Button>
          )}
          <Group>
            <Button variant="default" onClick={onClose}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </Group>
        </Group>
      </Modal.Content>
    </Modal.Root>
  );
};

export default CountryModal;
