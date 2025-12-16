"use client";

import ActionPopover from "@/(admin)/components/ActionPopover";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import GlobalLoader from "@/components/GlobalLoader";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { getConditionText, getSelectionTextShipping } from "@lib/helpers";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Checkbox,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  createId,
  SubmitHandler,
  useFieldArray,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import {
  CargoZoneConfigSchema,
  CargoZoneType,
  GetAllCountryReturnType,
  LocationType,
} from "@repo/types";
import { IconEdit, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ShippingLocationDrawer from "./ShippingLocationDrawer";
import ShippingRuleDrawer from "./ShippingRuleDrawer";
import fetchWrapper from "@lib/wrappers/fetchWrapper";

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
  const [editingRule, setEditingRule] = useState<number | null>(null);
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
    formState: { isSubmitting, errors },
    watch,
  } = useForm<CargoZoneType>({
    resolver: zodResolver(CargoZoneConfigSchema),
    defaultValues: defaultValues || {
      uniqueId: createId(),
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
      const res = await fetchWrapper.get<GetAllCountryReturnType[]>(
        `/locations/get-all-countries`
      );
      if (!res.success) {
        throw new Error("Failed to fetch countries");
      }
      return res.data;
    },
    refetchOnMount: false,
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

  const { push } = useRouter();

  const onSubmit: SubmitHandler<CargoZoneType> = async (
    data: CargoZoneType
  ) => {
    const req = await fetchWrapper.post<{ success: boolean; message: string }>(
      `/shipping/create-or-update-cargo-zone`,
      data
    );
    if (!req.success) {
      notifications.show({
        title: "Hata",
        message: "Bölge kaydedilirken bir hata oluştu",
        color: "red",
      });
      return;
    }
    if (req.data.success) {
      notifications.show({
        title: "Başarılı",
        message: req.data.message,
        color: "green",
      });
      push("/admin/settings/shipping-settings");
    }
  };

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
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
        <Card p={"xs"} withBorder>
          <Card.Section className="border-b border-b-gray-400">
            <Group justify="space-between" p={"md"}>
              <Stack gap={"xs"}>
                <Title order={4}>Bölgeler</Title>
                {errors.locations && (
                  <Text c={"red"} size="sm">
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
              <Stack gap={"xs"}>
                <Title order={4}>Kurallar</Title>
                {errors.rules && (
                  <Text c={"red"} size="sm">
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
                    mb={index === ruleFields.length - 1 ? 0 : "xs"}
                    align="center"
                  >
                    <Stack gap={"xs"}>
                      <Group fz={"md"} c={"black"}>
                        <Text>{rule.name}</Text>
                        {rule.shippingPrice > 0 ? (
                          <Group gap={"1px"} wrap="nowrap" align="center">
                            <ProductPriceFormatter
                              fz={"xs"}
                              price={rule.shippingPrice}
                              currency={rule.currency}
                            />
                            <Text fz={"xs"}> - Kargo Ücreti</Text>
                          </Group>
                        ) : (
                          <Text fz={"xs"}>Ücretsiz Kargo</Text>
                        )}
                      </Group>
                      <Text fz={"md"} c={"dimmed"}>
                        {getConditionText(rule)}
                      </Text>
                    </Stack>
                    <Group>
                      <ActionIcon
                        variant="transparent"
                        size={"xs"}
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
            (rule) => rule.uniqueId === data.uniqueId
          );
          if (isExists !== -1) {
            updateRule(isExists, data);
          } else {
            appendRule(data);
          }
          closeRuleModal();
        }}
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
