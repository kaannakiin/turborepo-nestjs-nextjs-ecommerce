"use client";

import FormCard from "@/components/cards/FormCard";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import AdminInventoryLocationTypeSelect from "@/components/inputs/admin/AdminInventoryLocationTypeSelect";
import CityInput from "@/components/inputs/CityInput";
import CountryInput from "@/components/inputs/CountryInput";
import CustomPhoneInput from "@/components/inputs/CustomPhoneInput";
import DistrictInput from "@/components/inputs/DistrictInput";
import StateInput from "@/components/inputs/StateInput";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { CountryType } from "@repo/database/client";
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  useMutation,
  useQuery,
  useWatch,
  zodResolver,
} from "@repo/shared";
import {
  InventoryLocationZodSchema,
  InventoryLocationZodSchemaType,
  TURKEY_DB_ID,
} from "@repo/types";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconMail,
  IconMapPin,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import InventoryServiceInput from "../../components/InventoryServiceInput";

const InventoryFormPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isEditMode = slug && slug !== "new";

  const {
    data: existingData,
    isLoading: isLoadingData,
    isError: isLoadError,
    error: loadError,
  } = useQuery({
    queryKey: ["inventory-location-detail", slug],
    queryFn: async () => {
      const response = await fetchWrapper.get<InventoryLocationZodSchemaType>(
        `/admin/inventory/location/${slug}`
      );
      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error);
      }
      return response.data;
    },
    enabled: !!isEditMode,
    retry: false,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["upsert-inventory-location"],
    mutationFn: async (data: InventoryLocationZodSchemaType) => {
      const response = await fetchWrapper.post(
        "/admin/inventory/location",
        data
      );
      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error);
      }
      return response.data;
    },
    onSuccess: (_data, _variables, _result, context) => {
      notifications.show({
        title: "Başarılı",
        message: isEditMode
          ? "Lokasyon başarıyla güncellendi"
          : "Lokasyon başarıyla oluşturuldu",
        color: "green",
        icon: <IconCheck size={16} />,
      });

      context?.client?.invalidateQueries({
        queryKey: ["admin-inventory-location-list"],
      });

      if (isEditMode) {
        context?.client?.invalidateQueries({
          queryKey: ["inventory-location-detail", slug],
        });
      }

      router.push("/admin/inventory/location" as Route);
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Hata",
        message: error.message || "Lokasyon kaydedilirken bir hata oluştu",
        color: "red",
        icon: <IconX size={16} />,
      });
    },
  });

  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<InventoryLocationZodSchemaType>({
    resolver: zodResolver(InventoryLocationZodSchema),
    defaultValues: {
      countryId: TURKEY_DB_ID,
      countryType: CountryType.CITY,
      isActive: true,
      uniqueId: createId(),
      type: "WAREHOUSE",
      serviceZones: [],
    },
  });

  useEffect(() => {
    if (existingData && isEditMode) {
      reset({
        ...existingData,
        uniqueId: existingData.uniqueId || slug,
      });
    }
  }, [existingData, isEditMode, reset, slug]);

  const countryID = useWatch({
    control,
    name: "countryId",
    defaultValue: TURKEY_DB_ID,
  });

  const countryType = useWatch({
    control,
    name: "countryType",
    defaultValue: CountryType.CITY,
  });

  const cityId = useWatch({
    control,
    name: "cityId",
  });

  const resetLocationFields = (from: "country" | "state" | "city") => {
    if (from === "country") {
      setValue("stateId", null);
      setValue("cityId", null);
      setValue("districtId", null);
    } else if (from === "state") {
      setValue("cityId", null);
      setValue("districtId", null);
    } else if (from === "city") {
      setValue("districtId", null);
    }
  };

  const onSubmit: SubmitHandler<InventoryLocationZodSchemaType> = (data) => {
    mutate(data);
  };

  if (isEditMode && isLoadingData) {
    return <GlobalLoadingOverlay />;
  }

  if (isEditMode && isLoadError) {
    return (
      <Box maw={600} mx="auto" py="xl">
        <Alert
          icon={<IconAlertCircle size={24} />}
          title="Lokasyon Bulunamadı"
          color="red"
          variant="light"
        >
          <Stack gap="md">
            <Text size="sm">
              {(loadError as Error)?.message ||
                "İstenen lokasyon bulunamadı veya erişim izniniz yok."}
            </Text>
            <Group>
              <Button
                variant="light"
                color="red"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() =>
                  router.push("/admin/inventory/location" as Route)
                }
              >
                Listeye Dön
              </Button>
              <Button variant="subtle" onClick={() => router.refresh()}>
                Tekrar Dene
              </Button>
            </Group>
          </Stack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box maw={900} mx="auto" py="xl" pos={"relative"}>
      {isPending && <GlobalLoadingOverlay />}
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Button
              variant="subtle"
              color="gray"
              p={8}
              onClick={() => router.back()}
            >
              <IconArrowLeft size={20} />
            </Button>
            <div>
              <Title order={2}>
                {isEditMode ? "Lokasyonu Düzenle" : "Yeni Lokasyon Ekle"}
              </Title>
              {isEditMode && existingData && (
                <Text size="sm" c="dimmed">
                  {existingData.name}
                </Text>
              )}
            </div>
          </Group>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                label="Aktif"
                checked={field.value}
                onChange={field.onChange}
                size="md"
              />
            )}
          />
        </Group>

        <FormCard title="Temel Bilgiler">
          <Grid>
            <Grid.Col span={{ lg: 8, base: 6 }}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    label="Depo Adı"
                    placeholder="Örn: Ana Depo, İstanbul Depo"
                    error={fieldState.error?.message}
                    required
                  />
                )}
              />
            </Grid.Col>
            <Grid.Col span={{ lg: 4, base: 6 }}>
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
                  <AdminInventoryLocationTypeSelect
                    {...field}
                    error={fieldState.error?.message}
                    label="Depo Türü"
                  />
                )}
              />
            </Grid.Col>
          </Grid>
        </FormCard>

        <FormCard
          icon={
            <ThemeIcon variant="transparent" size={"md"}>
              <IconMapPin />
            </ThemeIcon>
          }
          title="Konum Bilgileri"
        >
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="countryId"
                control={control}
                render={({ field, fieldState }) => (
                  <CountryInput
                    value={field.value}
                    selectProps={{
                      label: "Ülke",
                      placeholder: "Ülke seçin",
                      error: fieldState.error?.message,
                      required: true,
                    }}
                    onChange={(selectData) => {
                      resetLocationFields("country");
                      field.onChange(selectData?.value ?? null);
                      if (selectData) {
                        setValue("countryType", selectData.country.type);
                      }
                    }}
                    locale="TR"
                  />
                )}
              />
            </Grid.Col>

            {countryType === "STATE" && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="stateId"
                  render={({ field, fieldState }) => (
                    <StateInput
                      addressType={countryType}
                      countryId={countryID}
                      onSelect={() => resetLocationFields("state")}
                      selectProps={{
                        ...field,
                        label: "Eyalet / Bölge",
                        placeholder: "Eyalet seçin",
                        error: fieldState.error?.message,
                        required: true,
                      }}
                    />
                  )}
                />
              </Grid.Col>
            )}

            {countryType === "CITY" && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Controller
                  control={control}
                  name="cityId"
                  render={({ field, fieldState }) => (
                    <CityInput
                      countryId={countryID}
                      addressType={countryType}
                      onSelect={() => resetLocationFields("city")}
                      selectProps={{
                        ...field,
                        label: "Şehir",
                        placeholder: "Şehir seçin",
                        error: fieldState.error?.message,
                        required: true,
                      }}
                    />
                  )}
                />
              </Grid.Col>
            )}

            {countryType === "CITY" &&
              countryID === TURKEY_DB_ID &&
              !!cityId && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Controller
                    control={control}
                    name="districtId"
                    render={({ field, fieldState }) => (
                      <DistrictInput
                        cityId={cityId}
                        countryId={countryID}
                        addressType={countryType}
                        selectProps={{
                          ...field,
                          label: "İlçe",
                          placeholder: "İlçe seçin",
                          error: fieldState.error?.message,
                        }}
                      />
                    )}
                  />
                </Grid.Col>
              )}

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="zipCode"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value ?? ""}
                    label="Posta Kodu"
                    placeholder="Örn: 34000"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Controller
                name="addressLine1"
                control={control}
                render={({ field, fieldState }) => (
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    label="Adres Satırı 1"
                    placeholder="Sokak, cadde, mahalle bilgisi"
                    error={fieldState.error?.message}
                    minRows={2}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Controller
                name="addressLine2"
                control={control}
                render={({ field, fieldState }) => (
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    label="Adres Satırı 2"
                    placeholder="Bina no, kat, daire (opsiyonel)"
                    error={fieldState.error?.message}
                    minRows={2}
                  />
                )}
              />
            </Grid.Col>
          </Grid>
        </FormCard>
        <InventoryServiceInput
          control={control}
          setValue={setValue}
          getValues={getValues}
        />
        <FormCard
          icon={
            <ThemeIcon variant="transparent" size={"md"}>
              <IconUser />
            </ThemeIcon>
          }
          title="İletişim Bilgileri"
        >
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="contactName"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value ?? ""}
                    label="İletişim Kişisi"
                    placeholder="Ad Soyad"
                    leftSection={<IconUser size={16} />}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <CustomPhoneInput
                    {...field}
                    label="Telefon"
                    size="sm"
                    radius="sm"
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value ?? ""}
                    label="E-posta"
                    placeholder="ornek@sirket.com"
                    leftSection={<IconMail size={16} />}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Grid.Col>
          </Grid>
        </FormCard>

        <Stack gap={"xs"}>
          {errors &&
            Object.keys(errors).length > 0 &&
            Object.entries(errors).map(([key, value]) => (
              <Alert
                key={key}
                icon={<IconAlertCircle size={16} />}
                title="Hata"
                color="red"
                variant="light"
              >
                {value?.root?.message || value?.message}
              </Alert>
            ))}
          <Group justify="end">
            <Button
              variant="default"
              type="button"
              onClick={() => router.back()}
            >
              İptal
            </Button>
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              {isEditMode ? "Güncelle" : "Kaydet"}
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Box>
  );
};

export default InventoryFormPage;
