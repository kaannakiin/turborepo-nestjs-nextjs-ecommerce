"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { queryClient } from "@lib/serverQueryClient";
import {
  Button,
  Drawer,
  Group,
  SimpleGrid,
  Switch,
  TextInput,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm, zodResolver } from "@repo/shared";
import {
  IyzicoPaymentMethodSchema,
  IyzicoPaymentMethodType,
} from "@repo/types";
import { useEffect } from "react";

interface IyzicoformProps {
  defaultValues?: IyzicoPaymentMethodType;
  opened: boolean;
  close: () => void;
  isLoading: boolean;
  refetch?: () => void;
}

const Iyzicoform = ({
  defaultValues,
  opened,
  close,
  isLoading,
  refetch,
}: IyzicoformProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<IyzicoPaymentMethodType>({
    resolver: zodResolver(IyzicoPaymentMethodSchema),
    defaultValues: defaultValues || {
      type: "IYZICO",
      isTestMode: true,
      iyzicoApiKey: "",
      iyzicoSecretKey: "",
      isActive: true,
    },
  });
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);
  const onSubmit: SubmitHandler<IyzicoPaymentMethodType> = async (data) => {
    const res = await fetchWrapper.post<{ success: boolean; message: string }>(
      "/admin/payments/create-payment-method",
      data
    );

    if (res.success) {
      close();
      refetch?.();
      queryClient.invalidateQueries({ queryKey: ["admin-payment-methods"] });
    }
  };
  return (
    <>
      {(isSubmitting || isLoading) && <GlobalLoadingOverlay />}
      <Drawer.Root
        opened={opened}
        onClose={close}
        size="100%"
        classNames={{
          title: "text-xl font-bold",
          header: "border-b border-b-gray-400 bg-gray-100",
        }}
        position="bottom"
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Iyzico Ödeme Ayarları</Drawer.Title>
            <Group justify="end" align="center">
              <Button onClick={close} variant="outline">
                İptal
              </Button>
              <Button variant="filled" onClick={handleSubmit(onSubmit)}>
                Kaydet
              </Button>
            </Group>
          </Drawer.Header>
          <Drawer.Body>
            <div className="flex flex-col gap-4 p-4 w-full h-full max-w-5xl mx-auto">
              <SimpleGrid cols={2}>
                <Controller
                  control={control}
                  name="iyzicoApiKey"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      withAsterisk
                      labelProps={{
                        fw: 600,
                      }}
                      variant="filled"
                      error={fieldState.error?.message}
                      label="Iyzico API Key"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="iyzicoSecretKey"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      withAsterisk
                      labelProps={{
                        fw: 600,
                      }}
                      variant="filled"
                      error={fieldState.error?.message}
                      label="Iyzico Secret Key"
                    />
                  )}
                />
                <Group gap={"md"}>
                  <Controller
                    control={control}
                    name="isTestMode"
                    render={({ field: { value, ...field }, fieldState }) => (
                      <Switch
                        {...field}
                        checked={value}
                        classNames={{
                          label: "font-semibold",
                        }}
                        error={fieldState.error?.message}
                        label={value ? "Test Modu Açık" : "Test Modu Kapalı"}
                        size="md"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field: { value, ...field }, fieldState }) => (
                      <Switch
                        {...field}
                        checked={value}
                        classNames={{
                          label: "font-semibold",
                        }}
                        error={fieldState.error?.message}
                        label={value ? "Aktif" : "Pasif"}
                        size="md"
                      />
                    )}
                  />
                </Group>
              </SimpleGrid>
            </div>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
};

export default Iyzicoform;
