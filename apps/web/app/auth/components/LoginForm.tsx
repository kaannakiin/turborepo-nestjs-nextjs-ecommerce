"use client";
import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { LoginSchema, LoginSchemaType } from "@repo/types";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, SubmitHandler, useForm, zodResolver } from "@repo/shared";
import CustomPhoneInput from "../../(user)/components/CustomPhoneInput";
import GlobalLoadingOverlay from "../../components/GlobalLoadingOverlay";

const LoginForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      type: "email",
      email: "",
      password: "",
    },
  });

  const type = watch("type") || "email";
  const { replace, push } = useRouter();
  const searchParams = useSearchParams();

  const onSubmit: SubmitHandler<LoginSchemaType> = async (data) => {
    const authReq = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-cache",
    });
    if (!authReq.ok) {
      setError("root", {
        message:
          "Giriş başarısız. Lütfen bilgilerinizi kontrol edin ve tekrar deneyin.",
      });
    } else {
      const redirectUrl = (searchParams.get("redirectUri") as string) || "/";
      push(redirectUrl);
    }
  };

  return (
    <Stack
      component={"form"}
      onSubmit={handleSubmit(onSubmit)}
      gap={"md"}
      py={"md"}
      className="w-full"
    >
      {isSubmitting && <GlobalLoadingOverlay />}
      {type === "email" ? (
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              placeholder="E-posta Adresi"
              size="md"
              radius={"md"}
              type="email"
              variant="filled"
              error={fieldState.error?.message}
            />
          )}
        />
      ) : (
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <CustomPhoneInput
              {...field}
              placeholder="Telefon Numarası"
              size="md"
              radius={"md"}
            />
          )}
        />
      )}

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            {...field}
            error={fieldState.error?.message}
            size="md"
            radius={"md"}
            variant="filled"
            placeholder="Şifre"
          />
        )}
      />
      {errors.root && (
        <Text fz={"sm"} c={"red"}>
          {errors.root.message}
        </Text>
      )}
      <Stack gap={"xs"}>
        <UnstyledButton
          className="hover:text-[var(--mantine-color-primary-9)] text-[var(--mantine-color-primary-5)] transition-colors duration-150"
          fz={"sm"}
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.set("tab", "forgot-password");
            replace(`/auth?${params.toString()}`);
          }}
          fw={700}
        >
          Şifremi unuttum
        </UnstyledButton>
        <Button type="submit" size="lg" radius={"md"}>
          Giriş Yap
        </Button>{" "}
        <Button
          leftSection={type === "email" ? <IconPhone /> : <IconMail />}
          justify="center"
          variant="light"
          onClick={() => {
            clearErrors();
            reset({
              type: type === "email" ? "phone" : "email",
              email: "",
              phone: "",
              password: "",
            });
          }}
        >
          {type === "email"
            ? "Telefon ile Giriş Yap"
            : "E-posta Adresi ile Giriş Yap"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default LoginForm;
