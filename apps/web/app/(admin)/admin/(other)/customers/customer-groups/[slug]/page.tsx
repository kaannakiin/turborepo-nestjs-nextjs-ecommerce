"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import RadioCard from "@/components/inputs/RadioCard";
import {
  useCreateCustomerSegment,
  useGetCustomerSegment,
} from "@hooks/mutations/admin/useAdminCustomer";
import {
  Box,
  Button,
  Divider,
  Group,
  Radio,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Controller, useForm, useWatch, zodResolver } from "@repo/shared";
import {
  CustomerGroupInputZodType,
  CustomerGroupOutputZodType,
  CustomerGroupSchema,
  customerSegmentDefaultValues,
} from "@repo/types";
import { IconChevronRight, IconGitBranch } from "@tabler/icons-react";
import { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { Activity, useEffect } from "react";
import FormCard from "../../../../../../components/cards/FormCard";
import CustomerConditionFlow from "../../components/CustomerConditionFlow";

const CustomerSegmentFormPage = () => {
  const params = useParams();
  const slug = params?.slug as string;

  const isEdit = !!slug && slug !== "new";

  const {
    data: segmentData,
    isLoading,
    isFetching,
  } = useGetCustomerSegment(slug);
  const { push, back } = useRouter();

  const [flowOpened, { open: openFlow, close: closeFlow }] =
    useDisclosure(false);
  const { mutate, isPending } = useCreateCustomerSegment();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    reset,
  } = useForm<CustomerGroupInputZodType>({
    resolver: zodResolver(CustomerGroupSchema),
    defaultValues: customerSegmentDefaultValues,
  });

  useEffect(() => {
    if (isEdit && segmentData) {
      reset(segmentData);
    } else if (!isEdit) {
      reset(customerSegmentDefaultValues);
    }
  }, [segmentData, isEdit, reset]);

  const name = useWatch({
    control,
    name: "name",
  });

  const conditions = useWatch({
    control,
    name: "conditions",
  });

  const type = useWatch({
    control,
    name: "type",
  });
  console.log("errors", errors);
  const onSubmit = (values: CustomerGroupOutputZodType) => {
    mutate(values, {
      onSuccess: (data, variables, _res, context) => {
        notifications.show({
          title: "Başarılı",
          message: isEdit
            ? "Müşteri segmenti güncellendi"
            : "Müşteri segmenti oluşturuldu",
          color: "green",
        });

        context.client.invalidateQueries({
          queryKey: ["customer-groups"],
        });

        if (data.segmentId) {
          context.client.invalidateQueries({
            queryKey: ["customer-group", data.segmentId],
          });
        }

        push("/admin/customers/customer-groups" as Route);
      },
      onError: (error) => {
        notifications.show({
          title: "Hata",
          message: error.message || "Bir hata oluştu",
          color: "red",
        });
      },
    });
  };

  return (
    <Box maw={800} mx="auto" py="xl">
      <Activity
        mode={
          isPending || (isEdit && (isLoading || isFetching))
            ? "visible"
            : "hidden"
        }
      >
        <GlobalLoadingOverlay />
      </Activity>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>
                {isEdit ? "Segmenti Düzenle" : "Müşteri Segmenti Oluştur"}
              </Title>
              <Text c="dimmed" size="sm">
                Dinamik müşteri segmenti tanımlayın
              </Text>
            </div>
          </Group>

          <Divider />

          <FormCard title="Temel Bilgiler">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  label="Segment Adı"
                  withAsterisk
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  label="Açıklama"
                  rows={3}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Aktif"
                  description="Pasif segmentler raporlarda ve otomasyonlarda kullanılmaz"
                />
              )}
            />
          </FormCard>
          <Radio.Group>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <SimpleGrid cols={{ base: 1, lg: 2 }}>
                  <RadioCard
                    value="MANUAL"
                    checked={field.value === "MANUAL"}
                    label="Manuel"
                    description="Manuel olarak yönet"
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("conditions", null);
                    }}
                  />
                  <RadioCard
                    value="SMART"
                    checked={field.value === "SMART"}
                    label="Dinamik"
                    description="Otomatik olarak yönet"
                    onChange={(value) => {
                      field.onChange(value);
                      setValue("users", []);
                    }}
                  />
                </SimpleGrid>
              )}
            />
          </Radio.Group>
          <Activity mode={type === "SMART" ? "visible" : "hidden"}>
            <Button
              onClick={openFlow}
              variant="light"
              size="lg"
              fullWidth
              styles={{
                root: {
                  height: "auto",
                  padding: "var(--mantine-spacing-md)",
                },
                inner: {
                  justifyContent: "flex-start",
                },
                label: {
                  width: "100%",
                },
              }}
            >
              <Group wrap="nowrap" gap="md" w="100%">
                <IconGitBranch size={32} stroke={1.5} />
                <Stack gap={4} style={{ flex: 1, textAlign: "left" }}>
                  <Text fw={500} size="sm">
                    Karar Ağacı Oluştur
                  </Text>
                  <Text size="xs" c="dimmed" fw={400}>
                    Müşteri davranışlarına göre dinamik segment koşulları
                    belirleyin
                  </Text>
                </Stack>
                <IconChevronRight size={20} />
              </Group>
            </Button>
          </Activity>
          <Group justify="flex-end" gap="md">
            <Button
              variant="subtle"
              color="gray"
              disabled={isSubmitting}
              onClick={() => back()}
            >
              İptal
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? "Güncelle" : "Kaydet"}
            </Button>
          </Group>
        </Stack>
      </form>

      <CustomerConditionFlow
        opened={flowOpened}
        onClose={closeFlow}
        name={name}
        initialData={conditions}
        onSubmit={(data) => {
          setValue("conditions", data, {
            shouldDirty: true,
            shouldValidate: true,
          });
          closeFlow();
          notifications.show({
            title: "Başarılı",
            message: "Koşullar eklendi",
            color: "blue",
          });
        }}
      />
    </Box>
  );
};

export default CustomerSegmentFormPage;
