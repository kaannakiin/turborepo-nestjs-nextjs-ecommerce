"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import {
  Card,
  Divider,
  Group,
  InputBase,
  RadioIndicator,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { Controller, useForm, zodResolver } from "@repo/shared";
import {
  GetUserCartInfoForCheckoutReturn,
  PaymentSchema,
  PaymentType,
} from "@repo/types";
import { IconCheck } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { IMaskInput } from "react-imask";
import AddressCard from "./AddressCard";
import ShippingCard from "./ShippingCard";

interface PaymentStepProps {
  cart: GetUserCartInfoForCheckoutReturn;
}
const PaymentStep = ({ cart }: PaymentStepProps) => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const { media } = useTheme();

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

  return (
    <Stack gap={"lg"}>
      <AddressCard
        data={cart.shippingAddress}
        onEdit={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("step", "info");
          replace(`?${params.toString()}`);
        }}
      />
      <Divider size={"md"} />
      <ShippingCard
        cartData={{
          currency: cart.currency,
          methodTitle: cart.cargoRule ? cart.cargoRule.name : "Seçili Kargo",
          price: cart.cargoRule ? cart.cargoRule.price : 0,
        }}
        onEdit={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("step", "shipping");
          replace(`?${params.toString()}`);
        }}
      />
      <Divider size={"md"} />
      <Stack gap={"sm"} align="start">
        <Group align="center" gap={"sm"}>
          <ThemeIcon radius={"xl"} color="black" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"}>
              3
            </Text>
          </ThemeIcon>
          <Text fz={"lg"} fw={600}>
            Ödeme
          </Text>
        </Group>
        <Stack
          gap={"sm"}
          pl={media === "desktop" ? 40 : 0}
          className="w-full flex-1"
        >
          <Card
            withBorder
            bg={"#F7F7F9"}
            className="border-gray-900 border-2 gap-3"
            p={"lg"}
          >
            <Group gap={"xs"}>
              <RadioIndicator
                checked
                icon={IconCheck}
                color={"black"}
                classNames={{
                  icon: "size-4",
                }}
                size="md"
              />
            </Group>
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
                      const formatted = cleaned.replace(
                        /(\d{4})(?=\d)/g,
                        "$1 "
                      );
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
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PaymentStep;
