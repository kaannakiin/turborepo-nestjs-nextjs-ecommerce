"use client";

import CustomPhoneInput from "@/(user)/components/CustomPhoneInput";
import { TURKEY_DB_ID } from "@lib/constants";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  Card,
  Checkbox,
  Group,
  InputBase,
  Select,
  SimpleGrid,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  Control,
  Controller,
  UseFormSetValue,
  UseFormWatch,
  useQuery,
} from "@repo/shared";
import {
  GetAllCityReturnType,
  GetAllCountryReturnType,
  GetAllStateReturnType,
  PaymentZodType,
} from "@repo/types";
import { IconCheck } from "@tabler/icons-react";
import { IMaskInput } from "react-imask";

interface BillingAddressFormProps {
  control: Control<PaymentZodType>;
  setValue: UseFormSetValue<PaymentZodType>;
  watch: UseFormWatch<PaymentZodType>;
}

const BillingAddressForm = ({
  control,
  watch,
  setValue,
}: BillingAddressFormProps) => {
  const countryId = watch("billingAddress.countryId");
  const addressType = watch("billingAddress.addressType");
  const isCorporateInvoice = watch("billingAddress.isCorporateInvoice");

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

  const { data: states, isLoading: statesIsLoading } = useQuery({
    queryKey: ["get-states-by-country", countryId],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllStateReturnType[]>(
        `/locations/get-states-by-country/${countryId}`,
        {}
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
        `/locations/get-cities-by-country/${countryId}`
      );
      if (!res.success) {
        throw new Error("Failed to fetch cities");
      }
      return res.data;
    },
    enabled: !!countryId && addressType === "CITY",
  });

  const cityId = watch("billingAddress.cityId");

  const { data: district, isLoading: districtsLoading } = useQuery({
    queryKey: ["get-districts-turkey-city", countryId, cityId],
    queryFn: async () => {
      const fetchReq = await fetchWrapper.get<{
        success: boolean;
        data: { id: string; name: string }[];
      }>(`/locations/get-districts-turkey-city/${countryId}/${cityId}`, {});
      if (!fetchReq.success) {
        throw new Error("Failed to fetch districts");
      }
      if (!fetchReq.data.success || !fetchReq.data.data) {
        return [];
      }
      return fetchReq.data.data;
    },
    enabled:
      !!countryId &&
      !!cityId &&
      countryId === TURKEY_DB_ID &&
      addressType === "CITY",
  });
  const countryExists = countries && countries.length > 0;

  const handleCountryChange = (selectedCountryId: string | null) => {
    if (!selectedCountryId || !countryExists) return;

    const selectedCountry = countries.find((c) => c.id === selectedCountryId);
    if (!selectedCountry) return;

    setValue("billingAddress.cityId", null);
    setValue("billingAddress.stateId", null);
    setValue("billingAddress.districtId", null);

    setValue("billingAddress.addressType", selectedCountry.type);
    setValue("billingAddress.countryId", selectedCountry.id);
  };

  const handleStateChange = (selectedStateId: string | null) => {
    setValue("billingAddress.stateId", selectedStateId);
    setValue("billingAddress.cityId", null);
    setValue("billingAddress.districtId", null);
  };

  const handleCityChange = (selectedCityId: string | null) => {
    setValue("billingAddress.cityId", selectedCityId);
    setValue("billingAddress.districtId", null);
    setValue("billingAddress.stateId", null);
  };

  return (
    <Card
      bg={"#F7F7F9"}
      className="border-gray-900 border-2 gap-4"
      withBorder
      p="md"
    >
      <Group gap={"xs"} py={"xs"} align="center">
        <ThemeIcon radius={"xl"} size={"sm"} variant="filled" color="black">
          <IconCheck />
        </ThemeIcon>
        <Text fz={"md"} fw={500}>
          Fatura Adresi
        </Text>
      </Group>
      <SimpleGrid cols={{ xs: 1, md: 2 }}>
        <Controller
          control={control}
          name="billingAddress.name"
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
          name="billingAddress.surname"
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
        name="billingAddress.addressLine1"
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
          name="billingAddress.countryId"
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
            name="billingAddress.stateId"
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
            name="billingAddress.cityId"
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
        {addressType === "CITY" && countryId === TURKEY_DB_ID && (
          <Controller
            control={control}
            name="billingAddress.districtId"
            render={({ field, fieldState }) => (
              <Select
                {...field}
                error={fieldState.error?.message}
                disabled={
                  districtsLoading || !district || district.length === 0
                }
                data={
                  district && !districtsLoading
                    ? district.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))
                    : []
                }
                placeholder="Semt/Mahalle Seçin"
                size="lg"
                allowDeselect={false}
                searchable
                radius="md"
              />
            )}
          />
        )}
        <Controller
          control={control}
          name="billingAddress.addressLine2"
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

        {countryId !== TURKEY_DB_ID && (
          <Controller
            control={control}
            name="billingAddress.postalCode"
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
        )}
      </SimpleGrid>
      <Controller
        control={control}
        name="billingAddress.phone"
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
      {countryId === TURKEY_DB_ID && (
        <Controller
          control={control}
          name="billingAddress.tcKimlikNo"
          render={({ field, fieldState }) => (
            <InputBase
              component={IMaskInput}
              mask={"00000000000"}
              radius={"md"}
              {...field}
              error={fieldState.error?.message}
              size="lg"
              placeholder="T.C. Kimlik Numarası"
            />
          )}
        />
      )}
      <Controller
        control={control}
        name="billingAddress.isCorporateInvoice"
        render={({ field: { value, ...field }, fieldState }) => (
          <Checkbox
            checked={value}
            {...field}
            color="black"
            error={fieldState.error?.message}
            label="Kurumsal Fatura"
          />
        )}
      />
      {isCorporateInvoice && (
        <>
          <Controller
            control={control}
            name="billingAddress.companyName"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                placeholder="Şirket Adı"
                radius={"md"}
                size="lg"
                error={fieldState.error?.message}
              />
            )}
          />
          <SimpleGrid cols={{ xs: 1, md: 2 }}>
            <Controller
              control={control}
              name="billingAddress.taxNumber"
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
              name="billingAddress.companyRegistrationAddress"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  radius={"md"}
                  size="lg"
                  error={fieldState.error?.message}
                  placeholder="Şirketin Kayıtlı Adresi"
                />
              )}
            />
          </SimpleGrid>
        </>
      )}
    </Card>
  );
};

export default BillingAddressForm;
