"use client";

import CustomPhoneInput from "@/(user)/components/CustomPhoneInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { TURKEY_DB_ID } from "@lib/constants";
import {
  Button,
  Checkbox,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
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
  BillingAddressSchema,
  BillingAddressZodType,
  GetAllCityReturnType,
  GetAllCountryReturnType,
  GetAllStateReturnType,
} from "@repo/types";

interface BillingAddressFormProps {
  defaultValues?: BillingAddressZodType;
  onSubmit?: SubmitHandler<BillingAddressZodType>;
}

const BillingAddressForm = ({
  defaultValues,
  onSubmit,
}: BillingAddressFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<BillingAddressZodType>({
    resolver: zodResolver(BillingAddressSchema),
    defaultValues: defaultValues || {
      addressLine1: "",
      addressLine2: null,
      addressType: "NONE",
      cityId: null,
      countryId: TURKEY_DB_ID,
      id: createId(),
      name: "",
      phone: "",
      surname: "",
      stateId: null,
      postalCode: null,
      companyName: null,
      companyRegistrationAddress: null,
      taxNumber: null,
      isCorporateInvoice: false,
    },
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

  const isCorporateInvoice = watch("isCorporateInvoice");

  return (
    <Stack px={"xs"}>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Text fz="lg" fw={500}>
        Fatura Adresi
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
      <Controller
        control={control}
        name="isCorporateInvoice"
        render={({ field: { value, ...field }, fieldState }) => (
          <Checkbox
            checked={value}
            {...field}
            error={fieldState.error?.message}
            color="black"
            label={
              <Text>
                Kurumsal Fatura İstiyorum (Vergi Numarası, Firma Adı vb.
                bilgileri)
              </Text>
            }
          />
        )}
      />
      {isCorporateInvoice && (
        <>
          <Controller
            control={control}
            name="companyName"
            render={({ field, fieldState }) => (
              <TextInput
                radius={"md"}
                size="lg"
                {...field}
                error={fieldState.error?.message}
                placeholder="Firma Adı"
              />
            )}
          />
          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="taxNumber"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  radius={"md"}
                  size="lg"
                  error={fieldState.error?.message}
                  placeholder="Vergi Numarası"
                />
              )}
            />
            <Controller
              control={control}
              name="companyRegistrationAddress"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  radius={"md"}
                  size="lg"
                  error={fieldState.error?.message}
                  placeholder="Vergi Dairesi"
                />
              )}
            />
          </SimpleGrid>
        </>
      )}
      <Button
        variant="outline"
        size="lg"
        radius={"md"}
        color="black"
        onClick={handleSubmit(onSubmit)}
      >
        Fatura Adresi Kaydet
      </Button>
    </Stack>
  );
};

export default BillingAddressForm;
