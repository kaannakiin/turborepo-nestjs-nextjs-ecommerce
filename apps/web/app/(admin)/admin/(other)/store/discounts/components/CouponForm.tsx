"use client";

import {
  Button,
  Center,
  Group,
  InputError,
  Modal,
  NumberInput,
  Radio,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Control,
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  zodResolver,
} from "@repo/shared";
import {
  AutomaticCoupon,
  AutomaticCouponSchema,
  Coupon,
  CouponSchema,
  MainDiscount,
} from "@repo/types";
import { useEffect, useState } from "react";
import FormCard from "./FormCard";

interface CouponFormProps {
  control: Control<MainDiscount>;
  error?: string;
}

type CouponType = "automatic" | "custom";

const generateReadableCouponCode = (prefix: string = ""): string => {
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
  const vowels = "AEIOU";
  const numbers = "23456789";

  // Prefix varsa kullan, yoksa varsayılan
  const finalPrefix = prefix.trim() || "DISC";

  // 2 harf + 2 rakam + 2 harf formatı (örn: DISC-BA23KE)
  let code = finalPrefix + "-";

  // İlk 2 karakter: 1 sessiz + 1 sesli (okunabilir hece)
  code += consonants[Math.floor(Math.random() * consonants.length)];
  code += vowels[Math.floor(Math.random() * vowels.length)];

  // 2 rakam
  code += numbers[Math.floor(Math.random() * numbers.length)];
  code += numbers[Math.floor(Math.random() * numbers.length)];

  // Son 2 karakter: 1 sessiz + 1 sesli (okunabilir hece)
  code += consonants[Math.floor(Math.random() * consonants.length)];
  code += vowels[Math.floor(Math.random() * vowels.length)];

  return code;
};

const CouponForm = ({ control, error }: CouponFormProps) => {
  const [type, setType] = useState<CouponType>("custom");
  const [opened, { open, close }] = useDisclosure();

  const {
    control: formControl,
    handleSubmit,
    reset: resetAutomatic,
    clearErrors: clearAutomaticErrors, // ✅ Error temizleme
  } = useForm<AutomaticCoupon>({
    resolver: zodResolver(AutomaticCouponSchema),
    defaultValues: {
      numberOfCoupons: 5,
      prefix: "",
    },
  });

  const {
    control: customCouponControl,
    handleSubmit: customCouponHandleSubmit,
    reset: resetCustom,
    clearErrors: clearCustomErrors, // ✅ Error temizleme
  } = useForm<Coupon>({
    resolver: zodResolver(CouponSchema),
    defaultValues: {
      couponName: "",
    },
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "coupons",
  });

  useEffect(() => {
    if (type === "custom") {
      clearAutomaticErrors();
    } else {
      clearCustomErrors();
    }
  }, [type, clearAutomaticErrors, clearCustomErrors]);

  const onSubmit: SubmitHandler<AutomaticCoupon> = (data) => {
    // Otomatik kupon kodları üret
    const generatedCoupons: Coupon[] = [];

    for (let i = 0; i < data.numberOfCoupons; i++) {
      generatedCoupons.push({
        couponName: generateReadableCouponCode(data.prefix), // ✅ Okunabilir kod
      });
    }
    generatedCoupons.forEach((coupon) => {
      append(coupon);
    });

    resetAutomatic();
    close();
  };

  const onCustomCouponSubmit: SubmitHandler<Coupon> = (data) => {
    append(data);

    resetCustom();
    close();
  };

  const handleClose = () => {
    clearAutomaticErrors();
    clearCustomErrors();
    resetAutomatic();
    resetCustom();
    close();
  };

  return (
    <>
      <FormCard
        title={
          <Group align="center" justify="space-between" p={"md"}>
            <Stack gap={"xs"}>
              <Title order={4}>
                Kuponlar {fields.length > 0 ? `(${fields.length})` : ""}
              </Title>
              {error && <InputError>{error}</InputError>}
            </Stack>
            {fields.length > 0 && (
              <Group gap={"lg"}>
                <Button variant="light">Kupon Ekle</Button>
                <Button variant="outline" color="red" onClick={() => remove()}>
                  Tümünü Sil
                </Button>
              </Group>
            )}
          </Group>
        }
      >
        <ScrollArea h={200} py={"md"} scrollbarSize={6}>
          {fields && fields.length > 0 ? (
            <Stack gap="xs">
              {fields.map((field, index) => (
                <Group
                  key={field.id}
                  justify="space-between"
                  py={"4px"}
                  pl={"4px"}
                  pr={"md"}
                  className="hover:bg-gray-200 transition-colors duration-200"
                >
                  <Text fw={500}>{field.couponName}</Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => remove(index)}
                  >
                    Sil
                  </Button>
                </Group>
              ))}
            </Stack>
          ) : (
            <Center h={160} className="w-full h-full flex flex-col gap-2">
              <Text c="dimmed">Henüz eklenmiş bir kupon yok.</Text>
              <Button variant="light" onClick={open}>
                Kupon Ekle
              </Button>
            </Center>
          )}
        </ScrollArea>
      </FormCard>

      <Modal
        opened={opened}
        onClose={handleClose}
        size={"550"}
        title="Kupon Ekle"
        classNames={{
          header: "border-b border-b-gray-400",
        }}
      >
        <Stack gap={"lg"} py={"md"}>
          <Radio.Group
            value={type}
            onChange={(value) => {
              setType(value as CouponType);
            }}
          >
            <Group gap={"lg"}>
              <Radio value={"custom"} label="Özel Kupon" />
              <Radio value={"automatic"} label="Otomatik Kod Üret" />
            </Group>
          </Radio.Group>

          {type === "custom" ? (
            <Controller
              control={customCouponControl}
              name="couponName"
              render={({ field, fieldState }) => (
                <TextInput
                  {...{ ...field, onChange: undefined, onBlur: undefined }}
                  value={field.value || ""}
                  error={fieldState.error?.message}
                  label="Kod"
                  withAsterisk
                  description="Müşterilerin kullanacağı kupon kodu."
                  placeholder="Örn: HOSGELDIN20"
                  onChange={(event) => {
                    const rawValue = event.currentTarget.value;
                    const formattedValue = rawValue
                      .toLocaleUpperCase("tr-TR")
                      .replace(/\s+/g, "");

                    field.onChange(formattedValue);
                  }}
                  onBlur={() => {
                    const formattedValue = (field.value || "")
                      .toLocaleUpperCase("tr-TR")
                      .replace(/\s+/g, "");

                    field.onChange(formattedValue);
                  }}
                />
              )}
            />
          ) : (
            <>
              <Group gap={"xs"} grow>
                <Controller
                  control={formControl}
                  name="prefix"
                  render={({ field, fieldState }) => (
                    <TextInput
                      {...field}
                      error={fieldState.error?.message}
                      label="Kod Ön Eki"
                      placeholder="Örn: MARKETING"
                      onChange={(e) => {
                        const rawValue = e.currentTarget.value;
                        const formattedValue = rawValue
                          .toLocaleUpperCase("tr-TR")
                          .replace(/\s+/g, "");

                        field.onChange(formattedValue);
                      }}
                      onBlur={() => {
                        const formattedValue = (field.value || "")
                          .toLocaleUpperCase("tr-TR")
                          .replace(/\s+/g, "");

                        field.onChange(formattedValue);
                      }}
                    />
                  )}
                />
                <Controller
                  control={formControl}
                  name="numberOfCoupons"
                  render={({ field, fieldState }) => (
                    <NumberInput
                      {...field}
                      error={fieldState.error?.message}
                      min={1}
                      max={100}
                      label="Adet"
                      withAsterisk
                      hideControls
                      allowDecimal={false}
                      allowNegative={false}
                    />
                  )}
                />
              </Group>

              <Text size="sm" c="dimmed">
                <strong>Örnek kodlar:</strong>{" "}
                {generateReadableCouponCode("MARKETING")},{" "}
                {generateReadableCouponCode("MARKETING")},{" "}
                {generateReadableCouponCode("MARKETING")}
              </Text>
            </>
          )}

          <Group justify="end" mt={"xl"}>
            <Button variant="outline" onClick={handleClose}>
              İptal Et
            </Button>
            <Button
              variant="filled"
              onClick={() => {
                if (type === "custom") {
                  customCouponHandleSubmit(onCustomCouponSubmit)();
                  return;
                }
                handleSubmit(onSubmit)();
              }}
            >
              {type === "automatic" ? "Kodları Üret" : "Kaydet"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default CouponForm;
