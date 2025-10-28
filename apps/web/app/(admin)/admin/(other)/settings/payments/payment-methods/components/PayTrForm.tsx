"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Button,
  Drawer,
  Group,
  SimpleGrid,
  Switch,
  TextInput,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm, zodResolver } from "@repo/shared";
import { PayTRPaymentMethodSchema, PayTRPaymentMethodType } from "@repo/types";
import { useEffect } from "react";

interface PayTRFormProps {
  defaultValues?: PayTRPaymentMethodType;
  opened: boolean;
  close: () => void;
  isLoading: boolean;
  refetch?: () => void;
}

const PayTRForm = ({
  defaultValues,
  opened,
  close,
  refetch,
  isLoading,
}: PayTRFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PayTRPaymentMethodType>({
    resolver: zodResolver(PayTRPaymentMethodSchema),
    defaultValues: defaultValues || {
      type: "PAYTR",
      isTestMode: true,
      merchantId: "",
      merchantKey: "",
      merchantSalt: "",
      isActive: true,
    },
  });
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);
  const onSubmit: SubmitHandler<PayTRPaymentMethodType> = async (data) => {
    const res = await fetchWrapper.post<{ success: boolean; message: string }>(
      "/admin/payments/create-payment-method",
      data
    );

    if (res.success) {
      close();
      refetch?.();
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
            <Drawer.Title>PayTR Ödeme Ayarları</Drawer.Title>
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
                  name="merchantId"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      withAsterisk
                      labelProps={{
                        fw: 600,
                      }}
                      variant="filled"
                      error={fieldState.error?.message}
                      label="Merchant ID"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="merchantKey"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      withAsterisk
                      labelProps={{
                        fw: 600,
                      }}
                      variant="filled"
                      error={fieldState.error?.message}
                      label="Merchant Key"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="merchantSalt"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      withAsterisk
                      labelProps={{
                        fw: 600,
                      }}
                      variant="filled"
                      error={fieldState.error?.message}
                      label="Merchant Salt"
                    />
                  )}
                />
                <Group align="end">
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
                        label={
                          value ? "Ödeme Yöntemi Aktif" : "Ödeme Yöntemi Pasif"
                        }
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

export default PayTRForm;
