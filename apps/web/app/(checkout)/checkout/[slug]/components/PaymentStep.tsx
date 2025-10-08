"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import GlobalLoader from "@/components/GlobalLoader";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { TURKEY_DB_ID } from "@lib/constants";
import fetchWrapper from "@lib/fetchWrapper";
import { getCartAssociationUrl } from "@lib/helpers";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
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
import {
  Controller,
  createId,
  SubmitHandler,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  BinCheckSuccessResponse,
  GetCartClientCheckoutReturnType,
  PaymentZodSchema,
  PaymentZodType,
} from "@repo/types";
import { IconCheck } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IMaskInput } from "react-imask";
import AddressCard from "./AddressCard";
import ShippingCard from "./ShippingCard";

const BillingAddressForm = dynamic(() => import("./BillingAddressForm"), {
  ssr: false,
  loading: () => <GlobalLoader />,
});

interface PaymentStepProps {
  cart: Pick<
    GetCartClientCheckoutReturnType["cart"],
    "cartId" | "currency" | "billingAddress" | "shippingAddress" | "cargoRule"
  >;
}

interface BinCheckResponse {
  success: boolean;
  message?: string;
  data?: BinCheckSuccessResponse;
}

const PaymentStep = ({ cart }: PaymentStepProps) => {
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();
  const { media } = useTheme();
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") || null
  );
  const [cardAssociationUrl, setCardAssociationUrl] = useState<string | null>(
    null
  );
  const previousBinRef = useRef<string>("");
  const binCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
  } = useForm<PaymentZodType>({
    resolver: zodResolver(PaymentZodSchema),
    defaultValues: {
      creditCardName: "",
      creditCardNumber: "",
      cvv: "",
      expiryDate: "",
      checkAggrements: true,
      isBillingAddressSame: true,
      billingAddress: cart.billingAddress
        ? {
            addressLine1: cart.billingAddress.addressLine1,
            addressLine2: cart.billingAddress.addressLine2 || null,
            cityId: cart.billingAddress.cityId || null,
            countryId: cart.billingAddress.countryId || TURKEY_DB_ID,
            name: cart.billingAddress.name || "",
            surname: cart.billingAddress.surname || "",
            phone: cart.billingAddress.phone || "",
            postalCode: null,
            stateId: cart.billingAddress.stateId || null,
            addressType: cart.billingAddress.addressLocationType || "CITY",
            id: cart.billingAddress.id || createId(),
            isCorporateInvoice: cart.billingAddress.isCorporateInvoice || false,
            taxNumber: cart.billingAddress.taxNumber || null,
            tcKimlikNo: cart.billingAddress.tcKimlikNo || null,
            companyName: cart.billingAddress.companyName || null,
            companyRegistrationAddress:
              cart.billingAddress.companyRegistrationAddress || null,
          }
        : cart.shippingAddress
          ? {
              addressLine1: cart.shippingAddress.addressLine1,
              addressLine2: cart.shippingAddress.addressLine2 || null,
              cityId: cart.shippingAddress.cityId || null,
              countryId: cart.shippingAddress.countryId || TURKEY_DB_ID,
              name: cart.shippingAddress.name || "",
              surname: cart.shippingAddress.surname || "",
              phone: cart.shippingAddress.phone || "",
              postalCode: null,
              stateId: cart.shippingAddress.stateId || null,
              addressType: cart.shippingAddress.addressLocationType || "CITY",
              id: createId(),
              isCorporateInvoice: false,
              taxNumber: null,
              companyName: null,
              tcKimlikNo: cart.shippingAddress.tcKimlikNo || null,
              companyRegistrationAddress: null,
            }
          : null,
    },
  });

  const isBillingAddressSame = watch("isBillingAddressSame");
  const creditCardNumber = watch("creditCardNumber");

  useEffect(() => {
    if (errorMessage) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      replace(`?${params.toString()}`);
    }
  }, [errorMessage, replace, searchParams]);

  const checkBinNumber = async (bin: string) => {
    try {
      const res = await fetchWrapper.post<BinCheckResponse>(
        `/payment/bin-check`,
        {
          credentials: "include",
          body: JSON.stringify({ binNumber: bin }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.success && res.data) {
        setCardAssociationUrl(
          getCartAssociationUrl(res.data.data.cardAssociation) || null
        );
      } else {
        setCardAssociationUrl(null);
      }
    } catch (error) {
      setCardAssociationUrl(null);
    }
  };

  // Kart numarası değiştiğinde BIN kontrolü
  useEffect(() => {
    // Önceki timeout'u temizle
    if (binCheckTimeoutRef.current) {
      clearTimeout(binCheckTimeoutRef.current);
      binCheckTimeoutRef.current = null;
    }

    if (!creditCardNumber) {
      setCardAssociationUrl(null);
      previousBinRef.current = "";
      return;
    }

    // Sadece rakamları al
    const cleanNumber = creditCardNumber.replace(/\D/g, "");

    // İlk 6 hane var mı kontrol et
    if (cleanNumber.length >= 6) {
      const currentBin = cleanNumber.substring(0, 6);

      // Önceki BIN ile aynı mı kontrol et
      if (currentBin !== previousBinRef.current) {
        // Debounce: 500ms bekle
        binCheckTimeoutRef.current = setTimeout(() => {
          previousBinRef.current = currentBin;
          checkBinNumber(currentBin);
        }, 500);
      }
    } else {
      setCardAssociationUrl(null);
      previousBinRef.current = "";
    }

    // Cleanup function
    return () => {
      if (binCheckTimeoutRef.current) {
        clearTimeout(binCheckTimeoutRef.current);
        binCheckTimeoutRef.current = null;
      }
    };
  }, [creditCardNumber]);

  const onSubmit: SubmitHandler<PaymentZodType> = async (
    data: PaymentZodType
  ) => {
    const paymentReq = await fetchWrapper.post<{
      success: boolean;
      message: string;
      initThreeD?: boolean;
      threeDHtmlContent?: string;
      orderNumber?: string;
    }>(`/payment/create-payment/${cart.cartId}`, {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (paymentReq.success) {
      if (paymentReq.data.success) {
        if (paymentReq.data.initThreeD && paymentReq.data.threeDHtmlContent) {
          console.log(paymentReq.data);
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = atob(paymentReq.data.threeDHtmlContent);
          document.body.appendChild(tempDiv);
          const form = tempDiv.querySelector("form");
          if (form) {
            form.submit();
          } else {
            throw new Error("3D Secure form bulunamadı");
          }
        } else {
          if (!paymentReq.data.initThreeD && paymentReq.data.orderNumber) {
            push(`/order/${paymentReq.data.orderNumber}`);
          }
        }
      } else {
        // API'den success: false geldi (Örn: Yetersiz bakiye)
        // Hata mesajını göster
      }
    }
  };
  return (
    <>
      {isSubmitting && <GlobalLoadingOverlay />}
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
              <Group gap={"xs"} align="center">
                <RadioIndicator
                  checked
                  icon={IconCheck}
                  color={"black"}
                  classNames={{
                    icon: "size-4",
                  }}
                  size="md"
                />
                <Text fz="md" fw={500}>
                  Kredi Kartı
                </Text>
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
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 16) {
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
                    maxLength={19}
                    classNames={{
                      section: "!m-0 !p-0",
                    }}
                    label={
                      <Text fz={"sm"} fw={500}>
                        Kart Numarası
                      </Text>
                    }
                    rightSection={
                      cardAssociationUrl ? (
                        <Avatar
                          src={cardAssociationUrl}
                          size={"md"}
                          radius={0}
                        />
                      ) : null
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
              {errorMessage && (
                <Text c={"red"} fz={"md"}>
                  {errorMessage}
                </Text>
              )}
            </Card>
            <Controller
              control={control}
              name="checkAggrements"
              render={({ field: { value, ...field }, fieldState }) => (
                <Checkbox
                  {...field}
                  checked={value}
                  color="black"
                  error={fieldState.error?.message}
                  label={
                    <Text className="text-xs">
                      <span className="font-semibold text-sm">
                        Gizlilik politikasını ve Hizmet Şartlarını{" "}
                      </span>
                      ve{" "}
                      <span className="font-semibold text-sm">
                        Mesafeli Satış Sözleşmesini
                      </span>{" "}
                      okudum, onaylıyorum
                    </Text>
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="isBillingAddressSame"
              render={({ field: { value, ...field }, fieldState }) => (
                <Checkbox
                  checked={value}
                  {...field}
                  color="black"
                  error={fieldState.error?.message}
                  label={
                    <Text className="text-xs">
                      Fatura adresim, teslimat adresim ile aynı olsun. (Kurumsal
                      Fatura seçeneği için, check işaretini kaldırarak
                      adresinizi düzenleyiniz.)
                    </Text>
                  }
                />
              )}
            />
            {!isBillingAddressSame && (
              <BillingAddressForm
                control={control}
                setValue={setValue}
                watch={watch}
              />
            )}
            <Button
              fullWidth
              size="lg"
              radius={"md"}
              variant="filled"
              color="black"
              onClick={handleSubmit(onSubmit)}
            >
              Siparişi Tamamla
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default PaymentStep;
