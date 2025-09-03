"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { RegisterSchema, RegisterSchemaType } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "@repo/shared";
import CustomPhoneInput from "../../(user)/components/CustomPhoneInput";
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
      const registerReq = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await registerReq.json();

      if (!registerReq.ok) {
        setError("root", {
          message: responseData.message || "Bir hata oluştu",
        });
        return;
      }
      const redirectUrl = (searchParams.get("redirectUri") as string) || "/";
      push(redirectUrl);
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
              variant="filled"
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
              variant="filled"
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
            variant="filled"
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
            variant="filled"
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
            variant="filled"
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
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Üye Ol
        </Button>
      </Stack>
    </Stack>
  );
};

export default RegisterForm;
