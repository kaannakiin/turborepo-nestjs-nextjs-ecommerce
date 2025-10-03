"use client";

import CustomPhoneInput from "@/(user)/components/CustomPhoneInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { TURKEY_DB_ID } from "@lib/constants";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import {
  AuthUserAddressSchema,
  AuthUserAddressZodType,
  GetAllCityReturnType,
  GetAllCountryReturnType,
  GetAllStateReturnType,
} from "@repo/types";
import { IconCheck } from "@tabler/icons-react";

interface AuthUserAddressFormProps {
  defaultValues?: AuthUserAddressZodType;
  onSubmit: SubmitHandler<AuthUserAddressZodType>;
}

const AuthUserAddressForm = ({
  onSubmit,
  defaultValues,
}: AuthUserAddressFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm<AuthUserAddressZodType>({
    resolver: zodResolver(AuthUserAddressSchema),
    defaultValues: defaultValues || {
      addressLine1: "",
      addressLine2: null,
      cityId: "",
      countryId: TURKEY_DB_ID,
      addressTitle: "",
      addressType: "CITY",
      id: createId(),
      name: "",
      phone: "",
      postalCode: null,
      stateId: null,
      surname: "",
    },
  });
  const countryId = watch("countryId");
  const addressType = watch("addressType");
  const { data: countries, isLoading: countriesIsLoading } = useQuery({
    queryKey: ["get-all-countries"],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllCountryReturnType[]>(
        `/locations/get-all-countries`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.success) {
        throw new Error("Failed to fetch countries");
      }
      return res.data;
    },
    refetchOnMount: false,
  });

  const { data: states, isLoading: statesIsLoading } = useQuery({
    queryKey: ["get-states-by-country", countryId],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllStateReturnType[]>(
        `/locations/get-states-by-country/${countryId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.success) {
        throw new Error("Failed to fetch states");
      }
      return res.data;
    },
    enabled: !!countryId && addressType === "STATE",
  });

  const { data: cities, isLoading: citiesIsLoading } = useQuery({
    queryKey: ["get-cities-by-country", countryId],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllCityReturnType[]>(
        `/locations/get-cities-by-country/${countryId}`,
        {
          credentials: "include",
        }
      );
      if (!res.success) {
        throw new Error("Failed to fetch cities");
      }
      return res.data;
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

    setValue("addressType", selectedCountry.type);
    setValue("countryId", selectedCountry.id);
  };

  const handleStateChange = (selectedStateId: string | null) => {
    setValue("stateId", selectedStateId);
    setValue("cityId", null);
  };

  return (
    <>
      {(countriesIsLoading ||
        citiesIsLoading ||
        statesIsLoading ||
        isSubmitting) && <GlobalLoadingOverlay />}
      <Stack gap={"xs"}>
        <Card
          bg={"#F7F7F9"}
          className="border-gray-900 border-2 gap-2"
          withBorder
          p="md"
        >
          <Group gap={"xs"} py={"xs"} align="center">
            <ThemeIcon radius={"xl"} size={"sm"} variant="filled" color="black">
              <IconCheck />
            </ThemeIcon>
            <Text fz={"md"} fw={500}>
              {defaultValues ? defaultValues.addressTitle : "Yeni Adres"}
            </Text>
          </Group>
          <Controller
            control={control}
            name="addressTitle"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                size="lg"
                placeholder="Adres Başlığı (Ev, İş vb.)"
                radius="md"
                error={fieldState.error?.message}
              />
            )}
          />
          <SimpleGrid cols={{ xs: 1, md: 2 }}>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  size="lg"
                  placeholder="Ad"
                  radius="md"
                  error={fieldState.error?.message}
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
                  onChange={(e) => {
                    if (e.currentTarget.value.trim() === "") {
                      field.onChange(null);
                    } else {
                      field.onChange(e);
                    }
                  }}
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
                  onChange={(e) => {
                    if (e.currentTarget.value.trim() === "") {
                      field.onChange(null);
                    } else {
                      field.onChange(e);
                    }
                  }}
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
        </Card>
        <Button
          variant="filled"
          size="lg"
          radius={"md"}
          color="black"
          onClick={handleSubmit(onSubmit)}
        >
          Kaydet
        </Button>
      </Stack>
    </>
  );
};

export default AuthUserAddressForm;
