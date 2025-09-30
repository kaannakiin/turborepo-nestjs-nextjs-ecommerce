"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import {
  Button,
  Card,
  Checkbox,
  Group,
  InputBase,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Controller, SubmitHandler, useForm, zodResolver } from "@repo/shared";
import {
  BillingAddressZodType,
  PaymentReqReturnType,
  PaymentSchema,
  PaymentType,
} from "@repo/types";
import { IconShieldFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import BillingAddressForm from "./BillingAddressForm";

interface NonAuthUserPaymentFormProps {
  billingAddress: BillingAddressZodType;
  cartId: string;
  isShippingAddress: boolean;
  refetch: () => void;
}

const NonAuthUserPaymentForm = ({
  billingAddress,
  cartId,
  refetch,
  isShippingAddress,
}: NonAuthUserPaymentFormProps) => {
  const [checkedBilling, setCheckedBilling] =
    useState<boolean>(isShippingAddress);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    setError,
  } = useForm<PaymentType>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      creditCardName: "",
      creditCardNumber: "",
      cvv: "",
      expiryDate: "",
      checkAggrements: true,
    },
  });
  const onSubmit: SubmitHandler<PaymentType> = async (data) => {
    const paymentReq = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/create-payment-intent/${cartId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!paymentReq.ok) {
      const res = await paymentReq.json();
      setError("root", {
        message: res?.message || "Ödeme işlemi başarısız oldu.",
      });
    }
    const paymentRes = (await paymentReq.json()) as PaymentReqReturnType;
    // frontend
    if (paymentRes.success && paymentRes.threeDSHtmlContent) {
      const decodedHtml = atob(paymentRes.threeDSHtmlContent);
      const tempDiv = document.createElement("div");
      tempDiv.style.display = "none";
      tempDiv.innerHTML = decodedHtml;
      document.body.appendChild(tempDiv);
      const form = tempDiv.querySelector("form") as HTMLFormElement | null;
      form?.submit();
      return;
    }
  };

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      const timeoutId = setTimeout(() => {
        clearErrors();
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [clearErrors, errors]);

  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
      <Group justify="space-between" align="center">
        <Group gap="sm" align="center">
          <ThemeIcon radius="xl" color="black" size="lg">
            <Text fz={"xl"} fw={700} ta={"center"}>
              3
            </Text>
          </ThemeIcon>
          <Text fw={600} size="lg">
            Ödeme
          </Text>
        </Group>
      </Group>
      <Stack gap={"md"} pl={{ xs: 0, md: 48 }}>
        <Card
          withBorder
          bg={"#F7F7F9"}
          className="border-gray-900 border-2 gap-2"
          p={"lg"}
        >
          <Controller
            control={control}
            name="creditCardNumber"
            render={({ field, fieldState }) => (
              <TextInput
                size="lg"
                radius={"md"}
                errorProps={{
                  fz: "sm",
                }}
                value={field.value || ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ""); // Sadece rakamlar
                  if (value.length <= 16) {
                    // 4'lü gruplar halinde format
                    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                    field.onChange(value);
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData("text");
                  const cleaned = pastedData.replace(/\D/g, "");
                  if (cleaned.length <= 16) {
                    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
                    field.onChange(formatted);
                  }
                }}
                error={fieldState.error?.message}
                maxLength={19} // 16 rakam + 3 boşluk
                label={
                  <Text fz={"sm"} fw={500}>
                    Kart Numarası
                  </Text>
                }
              />
            )}
          />
          <Controller
            control={control}
            name="creditCardName"
            render={({ field, fieldState }) => (
              <TextInput
                size="lg"
                radius={"md"}
                errorProps={{
                  fz: "sm",
                }}
                {...field}
                error={fieldState.error?.message}
                label={
                  <Text fz={"sm"} fw={500}>
                    Kart Üzerindeki İsim
                  </Text>
                }
              />
            )}
          />
          <SimpleGrid cols={{ xs: 1, sm: 1, md: 2 }}>
            <Controller
              control={control}
              name="expiryDate"
              render={({ field, fieldState }) => (
                <InputBase
                  component={IMaskInput}
                  mask={"00/00"}
                  size="lg"
                  errorProps={{
                    fz: "sm",
                  }}
                  radius={"md"}
                  {...field}
                  error={fieldState.error?.message}
                  label={
                    <Text fz={"sm"} fw={500}>
                      Ay / Yıl
                    </Text>
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="cvv"
              render={({ field, fieldState }) => (
                <InputBase
                  component={IMaskInput}
                  mask={"000"}
                  size="lg"
                  radius={"md"}
                  {...field}
                  errorProps={{
                    fz: "sm",
                  }}
                  error={fieldState.error?.message}
                  label={
                    <Text fz={"sm"} fw={500}>
                      CVV
                    </Text>
                  }
                />
              )}
            />
          </SimpleGrid>
        </Card>
        <Checkbox
          color={"black"}
          checked={checkedBilling}
          onChange={(e) => setCheckedBilling(e.currentTarget.checked)}
          label={
            <Text fz={"sm"} c={"dimmed"}>
              Fatura adresim, teslimat adresim ile aynı olsun. (Kurumsal Fatura
              seçeneği için, check işaretini kaldırarak adresinizi
              düzenleyiniz.)
            </Text>
          }
        />
        {!checkedBilling && (
          <BillingAddressForm
            defaultValues={billingAddress ? billingAddress : null}
            onSubmit={async (data) => {
              const req = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/set-billing-address-to-cart/${cartId}`,
                {
                  method: "POST",
                  body: JSON.stringify(data),
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              if (!req.ok) {
                notifications.show({
                  message: "Fatura adresi kaydedilirken bir hata oluştu.",
                  color: "red",
                  title: "Hata",
                });
              } else {
                notifications.show({
                  message: "Fatura adresi başarıyla kaydedildi.",
                  color: "green",
                  title: "Başarılı",
                });
                refetch();
              }
            }}
          />
        )}
        <Controller
          control={control}
          name="checkAggrements"
          render={({ field: { value, ...field }, fieldState }) => (
            <Checkbox
              color="black"
              error={fieldState.error?.message}
              checked={value}
              {...field}
              label={
                <Text fz={"sm"}>
                  Gizlilik Politikasını, Hizmet Şartlarını ve Mesafeli Satış
                  Sözleşmesini okudum, onaylıyorum.
                </Text>
              }
            />
          )}
        />
        {errors.root && (
          <Text fz={"sm"} c="red">
            {errors.root.message}
          </Text>
        )}
        <Button
          variant="filled"
          size="lg"
          radius={"md"}
          color="black"
          onClick={handleSubmit(onSubmit)}
        >
          Siparişi Tamamla
        </Button>
        <Group gap={"xs"} justify="center">
          <ThemeIcon variant="transparent" c={"dimmed"}>
            <IconShieldFilled />
          </ThemeIcon>
          <Text c={"dimmed"}>
            Ödemeler SSL güvenlik sertifikası ile korunmaktadır.
          </Text>
        </Group>
      </Stack>
    </>
  );
};

export default NonAuthUserPaymentForm;
