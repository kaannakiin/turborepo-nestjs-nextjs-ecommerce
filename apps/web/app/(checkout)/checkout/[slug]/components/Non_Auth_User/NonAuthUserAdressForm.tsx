"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import CustomPhoneInput from "@/(user)/components/CustomPhoneInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import {
  Button,
  Checkbox,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  Controller,
  SubmitHandler,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import {
  GetAllCityReturnType,
  GetAllCountryReturnType,
  GetAllStateReturnType,
  NonAuthUserAddressSchema,
  NonAuthUserAddressZodType,
} from "@repo/types";
import { IconHelpCircleFilled } from "@tabler/icons-react";

interface AddressFormProps {
  onSubmit: SubmitHandler<NonAuthUserAddressZodType>;
  defaultValues: NonAuthUserAddressZodType;
}

const NonAuthUserAdressForm = ({
  onSubmit,
  defaultValues,
}: AddressFormProps) => {
  const { media } = useTheme();
  const { control, handleSubmit, setValue, watch } =
    useForm<NonAuthUserAddressZodType>({
      resolver: zodResolver(NonAuthUserAddressSchema),
      defaultValues: defaultValues,
    });
  const countryId = watch("countryId");
  const addressType = watch("addressType");

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
  });

  const { data: states, isLoading: statesIsLoading } = useQuery({
    queryKey: ["get-states-by-country", countryId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/locations/get-states-by-country/${countryId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to fetch states", await res.text());
        throw new Error("Failed to fetch states");
      }
      const data = (await res.json()) as GetAllStateReturnType[];
      return data;
    },
    enabled: !!countryId && addressType === "STATE",
  });

  const { data: cities, isLoading: citiesIsLoading } = useQuery({
    queryKey: ["get-cities-by-country", countryId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/locations/get-cities-by-country/${countryId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to fetch cities", await res.text());
        throw new Error("Failed to fetch cities");
      }
      const data = (await res.json()) as GetAllCityReturnType[];
      return data;
    },
    enabled: !!countryId && addressType === "CITY",
  });

  const countryExists = countries && countries.length > 0;

  const handleCountryChange = (selectedCountryId: string | null) => {
    if (!selectedCountryId || !countryExists) return;

    const selectedCountry = countries.find((c) => c.id === selectedCountryId);
    if (!selectedCountry) return;

    setValue("cityId", null);
    setValue("stateId", null);

    // Ülkenin address type'ına göre ayarla
    setValue("addressType", selectedCountry.type);
    setValue("countryId", selectedCountry.id);
  };

  const handleStateChange = (selectedStateId: string | null) => {
    setValue("stateId", selectedStateId);
    setValue("cityId", null);
  };
  return (
    <>
      {(countriesIsLoading || citiesIsLoading || statesIsLoading) && (
        <GlobalLoadingOverlay />
      )}
      {media === "desktop" ? (
        <Group gap={"sm"} align="start">
          <ThemeIcon radius={"xl"} color="black" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"}>
              1
            </Text>
          </ThemeIcon>
          <Stack gap={"lg"} className="flex-1">
            <Text fz={"lg"} fw={600}>
              Adres
            </Text>
            <Stack gap={"xl"}>
              <div className="flex flex-col gap-3">
                <Text fz={"xl"} c={"black"} fw={400}>
                  İletişim Bilgileri
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      type="email"
                      size="lg"
                      radius="md"
                      placeholder="E-Posta"
                      error={fieldState.error?.message}
                      rightSection={
                        <Tooltip
                          label="Sipariş bilgileri bu adrese gönderilecektir"
                          position="top"
                        >
                          <IconHelpCircleFilled />
                        </Tooltip>
                      }
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="campaignCheckbox"
                  render={({ field: { value, ...field } }) => (
                    <Checkbox
                      {...field}
                      checked={value}
                      color={"black"}
                      classNames={{
                        label: "text-gray-500",
                      }}
                      label="Beni kampanyalardan ve özel tekliflerden haberdar et"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Text fz={"xl"} c={"black"} fw={400}>
                  Teslimat Bilgileri
                </Text>

                <SimpleGrid cols={{ xs: 1, sm: 1, md: 2 }}>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        size="lg"
                        error={fieldState.error?.message}
                        placeholder="Ad"
                        radius="md"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="surname"
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        error={fieldState.error?.message}
                        placeholder="Soyad"
                        size="lg"
                        radius="md"
                      />
                    )}
                  />
                </SimpleGrid>

                <Controller
                  control={control}
                  name="addressLine1"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      error={fieldState.error?.message}
                      placeholder="Mahalle / Sokak / Cadde"
                      size="lg"
                      radius="md"
                    />
                  )}
                />

                <SimpleGrid cols={2}>
                  <Controller
                    control={control}
                    name="countryId"
                    render={({ field, fieldState }) => (
                      <Select
                        {...field}
                        allowDeselect={false}
                        error={fieldState.error?.message}
                        placeholder="Ülke Seçin"
                        size="lg"
                        searchable
                        radius="md"
                        onChange={handleCountryChange}
                        disabled={countriesIsLoading || !countryExists}
                        data={
                          countryExists
                            ? countries.map((country) => ({
                                value: country.id,
                                label: `${country.emoji} ${country.translations[0]?.name || "No Name"}`,
                              }))
                            : []
                        }
                      />
                    )}
                  />

                  {addressType === "STATE" && (
                    <Controller
                      control={control}
                      name="stateId"
                      render={({ field, fieldState }) => (
                        <Select
                          {...field}
                          error={fieldState.error?.message}
                          placeholder="Eyalet/Bölge Seçin"
                          size="lg"
                          searchable
                          allowDeselect={false}
                          radius="md"
                          onChange={handleStateChange}
                          disabled={statesIsLoading || !states?.length}
                          data={
                            states?.length
                              ? states.map((state) => ({
                                  value: state.id,
                                  label: state.name || "No Name",
                                }))
                              : []
                          }
                        />
                      )}
                    />
                  )}

                  {addressType === "CITY" && (
                    <Controller
                      control={control}
                      name="cityId"
                      render={({ field, fieldState }) => (
                        <Select
                          {...field}
                          error={fieldState.error?.message}
                          placeholder="Şehir Seçin"
                          size="lg"
                          allowDeselect={false}
                          searchable
                          radius="md"
                          disabled={citiesIsLoading || !cities?.length}
                          data={
                            cities?.length
                              ? cities.map((city) => ({
                                  value: city.id,
                                  label: city.name || "No Name",
                                }))
                              : []
                          }
                        />
                      )}
                    />
                  )}
                  <Controller
                    control={control}
                    name="addressLine2"
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        error={fieldState.error?.message}
                        placeholder="Apartman, Daire vb."
                        size="lg"
                        radius="md"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="postalCode"
                    render={({ field, fieldState }) => (
                      <TextInput
                        {...field}
                        error={fieldState.error?.message}
                        placeholder="Posta Kodu"
                        size="lg"
                        radius="md"
                      />
                    )}
                  />
                </SimpleGrid>

                <Controller
                  control={control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <CustomPhoneInput
                      {...field}
                      error={fieldState.error?.message}
                      radius={"md"}
                      size="lg"
                      placeholder="Telefon Numarası"
                    />
                  )}
                />
              </div>
              <Button
                size="lg"
                radius={"md"}
                variant="filled"
                color="black"
                onClick={handleSubmit(onSubmit)}
              >
                {"Kargo ile Devam Et"}
              </Button>
            </Stack>
          </Stack>
        </Group>
      ) : (
        <Stack>
          <Group gap={"sm"} align="start">
            <ThemeIcon radius={"xl"} color="black" size={"lg"}>
              <Text fz={"xl"} fw={700} ta={"center"}>
                1
              </Text>
            </ThemeIcon>
            <Text fz={"lg"} fw={600}>
              Adres
            </Text>
          </Group>
          <Stack gap={"xl"}>
            <div className="flex flex-col gap-3">
              <Text fz={"xl"} c={"black"} fw={400}>
                İletişim Bilgileri
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    type="email"
                    size="lg"
                    radius="md"
                    placeholder="E-Posta"
                    error={fieldState.error?.message}
                    rightSection={
                      <Tooltip
                        label="Sipariş bilgileri bu adrese gönderilecektir"
                        position="top"
                      >
                        <IconHelpCircleFilled />
                      </Tooltip>
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name="campaignCheckbox"
                render={({ field: { value, ...field } }) => (
                  <Checkbox
                    {...field}
                    checked={value}
                    color={"black"}
                    classNames={{
                      label: "text-gray-500",
                    }}
                    label="Beni kampanyalardan ve özel tekliflerden haberdar et"
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Text fz={"xl"} c={"black"} fw={400}>
                Teslimat Bilgileri
              </Text>

              <SimpleGrid cols={{ xs: 1, sm: 1, md: 2 }}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      size="lg"
                      error={fieldState.error?.message}
                      placeholder="Ad"
                      radius="md"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="surname"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      error={fieldState.error?.message}
                      placeholder="Soyad"
                      size="lg"
                      radius="md"
                    />
                  )}
                />
              </SimpleGrid>

              <Controller
                control={control}
                name="addressLine1"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    error={fieldState.error?.message}
                    placeholder="Mahalle / Sokak / Cadde"
                    size="lg"
                    radius="md"
                  />
                )}
              />

              <SimpleGrid cols={2}>
                <Controller
                  control={control}
                  name="countryId"
                  render={({ field, fieldState }) => (
                    <Select
                      {...field}
                      allowDeselect={false}
                      error={fieldState.error?.message}
                      placeholder="Ülke Seçin"
                      size="lg"
                      searchable
                      radius="md"
                      onChange={handleCountryChange}
                      disabled={countriesIsLoading || !countryExists}
                      data={
                        countryExists
                          ? countries.map((country) => ({
                              value: country.id,
                              label: `${country.emoji} ${country.translations[0]?.name || "No Name"}`,
                            }))
                          : []
                      }
                    />
                  )}
                />

                {addressType === "STATE" && (
                  <Controller
                    control={control}
                    name="stateId"
                    render={({ field, fieldState }) => (
                      <Select
                        {...field}
                        error={fieldState.error?.message}
                        placeholder="Eyalet/Bölge Seçin"
                        size="lg"
                        searchable
                        allowDeselect={false}
                        radius="md"
                        onChange={handleStateChange}
                        disabled={statesIsLoading || !states?.length}
                        data={
                          states?.length
                            ? states.map((state) => ({
                                value: state.id,
                                label: state.name || "No Name",
                              }))
                            : []
                        }
                      />
                    )}
                  />
                )}

                {addressType === "CITY" && (
                  <Controller
                    control={control}
                    name="cityId"
                    render={({ field, fieldState }) => (
                      <Select
                        {...field}
                        error={fieldState.error?.message}
                        placeholder="Şehir Seçin"
                        size="lg"
                        allowDeselect={false}
                        searchable
                        radius="md"
                        disabled={citiesIsLoading || !cities?.length}
                        data={
                          cities?.length
                            ? cities.map((city) => ({
                                value: city.id,
                                label: city.name || "No Name",
                              }))
                            : []
                        }
                      />
                    )}
                  />
                )}
                <Controller
                  control={control}
                  name="addressLine2"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      error={fieldState.error?.message}
                      placeholder="Apartman, Daire vb."
                      size="lg"
                      radius="md"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="postalCode"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      error={fieldState.error?.message}
                      placeholder="Posta Kodu"
                      size="lg"
                      radius="md"
                    />
                  )}
                />
              </SimpleGrid>

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <CustomPhoneInput
                    {...field}
                    error={fieldState.error?.message}
                    radius={"md"}
                    size="lg"
                    placeholder="Telefon Numarası"
                  />
                )}
              />
            </div>
            <Button
              size="lg"
              radius={"md"}
              variant="filled"
              color="black"
              onClick={handleSubmit(onSubmit)}
            >
              {"Kargo ile Devam Et"}
            </Button>
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default NonAuthUserAdressForm;
