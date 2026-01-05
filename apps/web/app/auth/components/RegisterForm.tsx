"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  Button,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm, zodResolver } from "@repo/shared";
import { RegisterSchema, RegisterSchemaType } from "@repo/types";
import { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import CustomPhoneInput from "../../components/inputs/CustomPhoneInput";
import GlobalLoadingOverlay from "../../components/GlobalLoadingOverlay";

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
      surname: "",
    },
  });

  const searchParams = useSearchParams();
  const { replace, push } = useRouter();

  const onSubmit: SubmitHandler<RegisterSchemaType> = async (data) => {
    try {
      const registerReq = await fetchWrapper.post<{
        success: boolean;
        message: string;
      }>("/auth/register", data);

      if (!registerReq.success) {
        setError("root", {
          message: "Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.",
        });
        return;
      }
      if (!registerReq.data.success) {
        setError("root", {
          message:
            registerReq.data.message ||
            "Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.",
        });
        return;
      }
      const authReq = await fetchWrapper.post("/auth/login", {
        username:
          data.email && data.email.trim() !== "" ? data.email : data.phone,
        password: data.password,
      });
      if (!authReq.success) {
        setError("root", {
          message: "Giriş başarısız. Lütfen manuel olarak giriş yapın.",
        });
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));

      //TODO MERGE CARTS

      // const mergeResult = await mergeCarts();

      // if (mergeResult.success) {
      //   console.log("✅ Sepet birleştirildi:", mergeResult.newCart?.cartId);
      // } else {
      //   console.warn("⚠️ Sepet birleştirme başarısız:", mergeResult.message);
      // }

      // ✅ Küçük bir delay - localStorage'ın kesin yazılmasını garanti et
      await new Promise((resolve) => setTimeout(resolve, 150));
      const redirectUrl = (searchParams.get("redirectUri") as string) || "/";
      push(redirectUrl as Route);
    } catch {
      setError("root", {
        message: "Bağlantı hatası oluştu",
      });
    }
  };

  return (
    <Stack gap={"md"} py={"md"} className="w-full">
      {isSubmitting && <GlobalLoadingOverlay />}

      <SimpleGrid cols={{ xs: 1, sm: 2 }}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              placeholder="İsim"
              size="md"
              radius={"md"}
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
              placeholder="Soyisim"
              size="md"
              radius={"md"}
            />
          )}
        />
      </SimpleGrid>

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            value={field.value || ""}
            error={fieldState.error?.message}
            type="email"
            size="md"
            radius={"md"}
            placeholder="E-posta Adresi"
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <CustomPhoneInput
            {...field}
            value={field.value || ""}
            error={fieldState.error?.message}
            size="md"
            radius={"md"}
            placeholder="Telefon Numarası"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            {...field}
            error={fieldState.error?.message}
            size="md"
            radius={"md"}
            placeholder="Şifre"
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <PasswordInput
            {...field}
            error={fieldState.error?.message}
            size="md"
            radius={"md"}
            placeholder="Şifre Tekrarı"
          />
        )}
      />

      {errors.root && (
        <Text fz={"sm"} c="red">
          {errors.root.message}
        </Text>
      )}

      <Stack gap={"xs"}>
        <UnstyledButton
          className="hover:text-[var(--mantine-color-primary-9)] text-[var(--mantine-color-primary-5)] transition-colors duration-150 "
          fz={"sm"}
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set("tab", "login");
            replace(`/auth?${params.toString()}`);
          }}
          fw={700}
        >
          Bir hesabınız var mı?
        </UnstyledButton>
        <Button
          type="button"
          size="lg"
          radius={"md"}
          onClick={handleSubmit(onSubmit)}
        >
          Üye Ol
        </Button>
      </Stack>
    </Stack>
  );
};

export default RegisterForm;
