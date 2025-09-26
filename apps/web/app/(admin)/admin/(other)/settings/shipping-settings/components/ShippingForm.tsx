"use client";

import ActionPopover from "@/(admin)/components/ActionPopoverr";
import GlobalLoader from "@/components/GlobalLoader";
import { getSelectionTextShipping } from "@lib/helpers";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { useFieldArray, useForm, useQuery, zodResolver } from "@repo/shared";
import {
  CargoZoneConfigSchema,
  CargoZoneType,
  GetAllCountryReturnType,
  LocationType,
} from "@repo/types";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import ShippingLocationDrawer from "./ShippingLocationDrawer";
import ShippingRuleDrawer from "./ShippingRuleDrawer";

interface ShippingFormProps {
  defaultValues?: CargoZoneType;
}

const ShippingForm = ({ defaultValues }: ShippingFormProps) => {
  const [opened, { open, close }] = useDisclosure();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure();
  const [editingLocation, setEditingLocation] = useState<LocationType | null>(
    null
  );
  const [openedRuleModal, { open: openRuleModal, close: closeRuleModal }] =
    useDisclosure();

  const handleEditLocation = (location: LocationType) => {
    setEditingLocation(location);
    openDrawer();
  };

  const handleCloseDrawer = () => {
    setEditingLocation(null);
    closeDrawer();
  };

  const handleUpdateLocation = (
    updatedLocation: LocationType,
    index: number
  ) => {
    updateLocation(index, updatedLocation);
    handleCloseDrawer();
  };

  const [countryFilters, setCountryFilters] = useDebouncedState<string>(
    "",
    500
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<CargoZoneType>({
    resolver: zodResolver(CargoZoneConfigSchema),
    defaultValues: defaultValues || {
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
    name: "locations",
  });

  const {
    fields: ruleFields,
    append: appendRule,
    update: updateRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: "rules",
  });

  const { data: countries, isLoading: countriesIsLoading } = useQuery({
    queryKey: ["get-all-countries"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/locations/get-all-countries`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to fetch countries", await res.text());
        throw new Error("Failed to fetch countries");
      }
      const data = (await res.json()) as GetAllCountryReturnType[];
      return data;
    },
    refetchOnMount: false,
    enabled: opened,
  });
  const locations = watch("locations");
  const filteredCountries =
    countryFilters.trim() !== "" ||
    countryFilters !== null ||
    countryFilters !== undefined
      ? countries?.filter((country) =>
          country.translations[0].name
            .toLowerCase()
            .includes(countryFilters.trim().toLowerCase())
        )
      : countries;
  return (
    <>
      <div className="flex flex-col gap-5">
        <Card p={"xs"} withBorder>
          <Card.Section className="border-b border-b-gray-400">
            <Group justify="space-between" p={"md"}>
              <Title order={4}>Bölgeler</Title>
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
                    (c) => c.id === location.countryId
                  );
                  if (!country) return null;
                  return (
                    <Group
                      key={location.countryId}
                      justify="space-between"
                      className="hover:bg-gray-100 transition-colors duration-200 ease-in-out px-3 py-2 rounded"
                      align="center"
                    >
                      <Group gap={"xs"}>
                        <Stack gap={"xs"}>
                          <Text>{country.translations[0].name}</Text>
                          <Text c={"dimmed"} fz={"sm"}>
                            {getSelectionTextShipping(location)}
                          </Text>
                        </Stack>
                      </Group>
                      <Group align="center" gap={"md"} justify="end">
                        {location.countryType !== "NONE" && (
                          <ActionIcon
                            onClick={() => {
                              handleEditLocation(location);
                            }}
                            variant="transparent"
                            size={"xs"}
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

        <Card p={"xs"} withBorder>
          <Card.Section className="border-b border-b-gray-400">
            <Group justify="space-between" p={"md"}>
              <Title order={4}>Kurallar</Title>
              {ruleFields && ruleFields.length > 0 && (
                <Button onClick={openRuleModal}>Kural Ekle</Button>
              )}
            </Group>
          </Card.Section>
          <div className="flex-1 flex flex-col ">
            {ruleFields && ruleFields.length > 0 ? (
              <ScrollArea py="sm" mah={500} className="flex flex-col gap-3">
                {ruleFields.map((rule, index) => (
                  <Group key={rule.id}>{rule.name}</Group>
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
      <Modal.Root
        opened={opened}
        classNames={{
          title: "text-lg font-medium",
          header: "border-b border-b-gray-500",
          body: "py-4 max-h-[50vh]",
        }}
        centered
        size="md"
        onClose={() => {
          close();
          setCountryFilters("");
        }}
      >
        <Modal.Overlay
          transitionProps={{ transition: "scale", duration: 300 }}
        />
        <Modal.Content>
          <Modal.Header className="flex flex-col gap-3">
            <Group justify="space-between" className="w-full">
              <Modal.Title>Bölge Ekle</Modal.Title>
              <Modal.CloseButton />
            </Group>
            <TextInput
              placeholder="Bölge adı"
              className="w-full"
              variant="filled"
              defaultValue={countryFilters}
              onChange={(event) => setCountryFilters(event.currentTarget.value)}
            />
          </Modal.Header>
          <Modal.Body>
            <Stack gap={"lg"}>
              {countriesIsLoading ? (
                <GlobalLoader />
              ) : (
                filteredCountries &&
                filteredCountries.length > 0 &&
                filteredCountries.map((country) => (
                  <Group
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                    key={country.id}
                    align="center"
                    gap={"lg"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        locationFields.find(
                          (loc) => loc.countryId === country.id
                        )
                      ) {
                        const index = locations.findIndex(
                          (loc) => loc.countryId === country.id
                        );
                        removeLocation(index);
                      } else {
                        appendLocation({
                          countryId: country.id,
                          countryType: country.type,
                          stateIds: country.type === "STATE" ? [] : null,
                          cityIds: country.type === "CITY" ? [] : null,
                        });
                      }
                    }}
                  >
                    <Checkbox
                      readOnly
                      checked={locationFields.some(
                        (loc) => loc.countryId === country.id
                      )}
                    />
                    <Text>
                      {country.emoji} {country.translations[0].name}
                    </Text>
                  </Group>
                ))
              )}
            </Stack>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <ShippingRuleDrawer
        closeRuleModal={closeRuleModal}
        openedRuleModal={openedRuleModal}
      />
      {editingLocation && (
        <ShippingLocationDrawer
          opened={drawerOpened}
          onClose={handleCloseDrawer}
          defaultValues={editingLocation}
          countryName={
            countries?.find((c) => c.id === editingLocation.countryId)
              ?.translations[0].name
          }
          onSubmit={(updateLocation) => {
            const index = locations.findIndex(
              (loc) => loc.countryId === editingLocation.countryId
            );
            handleUpdateLocation(updateLocation, index);
          }}
        />
      )}
    </>
  );
};

export default ShippingForm;
