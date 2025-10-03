"use client";
import CustomPhoneInput from "@/(user)/components/CustomPhoneInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { TURKEY_DB_ID } from "@lib/constants";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Button,
  Checkbox,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Controller,
  createId,
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type DeliveryType = "address" | "pickup";

const NonAuthUserAddressForm = ({
  cartId,
  defaultValues,
}: {
  cartId: string;
  defaultValues?: NonAuthUserAddressZodType;
}) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("address");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<NonAuthUserAddressZodType>({
    resolver: zodResolver(NonAuthUserAddressSchema),
    defaultValues: defaultValues || {
      addressLine1: "",
      addressLine2: null,
      addressType: "CITY",
      cityId: null,
      campaignCheckbox: true,
      countryId: TURKEY_DB_ID,
      email: "",
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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        clearErrors();
      }, 5000);
    }
  }, [errors, clearErrors]);

  const onSubmit: SubmitHandler<NonAuthUserAddressZodType> = async (data) => {
    const res = await fetchWrapper.post(
      `/cart-v2/set-non-auth-user-address-to-cart/${cartId}`,
      {
        body: JSON.stringify(data),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.success) {
      notifications.show({
        message: "Bir hata oluştu, lütfen tekrar deneyiniz.",
        color: "red",
        title: "Hata",
      });
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", "shipping");
    replace(`?${params.toString()}`);

    notifications.show({
      message: "Adres başarıyla kaydedildi.",
      color: "green",
      title: "Başarılı",
    });
  };

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Stack gap={"lg"}>
        <Stack gap={"xs"}>
          <Title order={3} fw={500}>
            İletişim Bilgileri
          </Title>
        </Stack>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <TextInput
                {...field}
                size="lg"
                placeholder="E-Posta"
                radius="md"
                type="email"
                error={fieldState.error?.message}
              />
              <Controller
                control={control}
                name="campaignCheckbox"
                render={({ field: { value, ...field }, fieldState }) => (
                  <Checkbox
                    color="black"
                    {...field}
                    checked={value}
                    error={fieldState.error?.message}
                    label="Kampanyalardan ve fırsatlardan haberdar olmak istiyorum."
                    classNames={{
                      label: "font-semibold",
                    }}
                  />
                )}
              />
            </div>
          )}
        />
        <Title order={3} fw={500}>
          Teslimat Adresi
        </Title>
        {/* <Radio.Group
        value={deliveryType}
        onChange={(value) => setDeliveryType(value as DeliveryType)}
      >
        <SimpleGrid cols={{ xs: 1, md: 2 }}>
          <Radio.Card
            py={"md"}
            px={"lg"}
            value="address"
            bg="#F7F7F9"
            radius={"md"}
            className={
              deliveryType === "address"
                ? "border-black border-2"
                : "border border-gray-400"
            }
          >
            <Group gap={"md"} align="center">
              <ThemeIcon
                size={"md"}
                variant="transparent"
                c={deliveryType === "address" ? "black" : "dimmed"}
              >
                <IconPackageExport />
              </ThemeIcon>
              <Text
                c={deliveryType === "address" ? "black" : "dimmed"}
                fz={"lg"}
              >
                Adrese Teslimat
              </Text>
            </Group>
          </Radio.Card>
          <Radio.Card
            py={"md"}
            px={"lg"}
            radius={"md"}
            value="pickup"
            bg="#F7F7F9"
            className={
              deliveryType === "pickup"
                ? "border-black border-2"
                : "border border-gray-400"
            }
          >
            <Group gap={"md"} align="center">
              <ThemeIcon
                size={"md"}
                variant="transparent"
                c={deliveryType === "pickup" ? "black" : "dimmed"}
              >
                <IconBuildingStore />
              </ThemeIcon>
              <Text
                fz={"lg"}
                c={deliveryType === "pickup" ? "black" : "dimmed"}
              >
                Mağazadan Teslimat
              </Text>
            </Group>
          </Radio.Card>
        </SimpleGrid>
      </Radio.Group> */}
        {deliveryType === "address" && (
          <Stack gap={"xs"}>
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
          </Stack>
        )}
        <Button
          fullWidth
          size="lg"
          radius={"md"}
          variant="filled"
          color="black"
          onClick={handleSubmit(onSubmit)}
        >
          {"Kargo ile Devam Et"}
        </Button>
        <Divider size={"md"} />
        <Group gap={"xl"}>
          <Group align="center" gap={"sm"}>
            <ThemeIcon radius={"xl"} color="gray.3" size={"lg"}>
              <Text fz={"xl"} fw={700} ta={"center"} c={"dimmed"}>
                2
              </Text>
            </ThemeIcon>
            <Text fz={"lg"} fw={600} c={"dimmed"}>
              Kargo
            </Text>
          </Group>
        </Group>
        <Divider size={"md"} />
        <Group gap={"xl"}>
          <Group align="center" gap={"sm"}>
            <ThemeIcon radius={"xl"} color="gray.3" size={"lg"}>
              <Text fz={"xl"} fw={700} ta={"center"} c={"dimmed"}>
                3
              </Text>
            </ThemeIcon>
            <Text fz={"lg"} fw={600} c={"dimmed"}>
              Ödeme
            </Text>
          </Group>
        </Group>
      </Stack>
    </>
  );
};

export default NonAuthUserAddressForm;
