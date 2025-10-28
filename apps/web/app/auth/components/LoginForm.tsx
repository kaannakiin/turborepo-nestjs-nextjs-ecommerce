"use client";
import { LOCALE_CART_COOKIE } from "@lib/constants";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm, zodResolver } from "@repo/shared";
import { LoginSchema, LoginSchemaType } from "@repo/types";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomPhoneInput from "../../(user)/components/CustomPhoneInput";
import GlobalLoadingOverlay from "../../components/GlobalLoadingOverlay";
import { Route } from "next";

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
    try {
      const authReq = await fetchWrapper.post("/auth/login", {
        username: data.type === "email" ? data.email : data.phone,
        password: data.password,
      });

      if (!authReq.success) {
        setError("root", {
          message: "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      //TODO: Bunu auth/login'de yapmak daha mantıklı olabilir
      localStorage.removeItem(LOCALE_CART_COOKIE);
      // const mergeResult = await mergeCarts();

      // if (mergeResult.success) {
      //   console.log("✅ Sepet birleştirildi:", mergeResult.newCart?.cartId);
      // } else {
      //   console.warn("⚠️ Sepet birleştirme başarısız:", mergeResult.message);
      // }

      await new Promise((resolve) => setTimeout(resolve, 150));

      const redirectUrl = (searchParams.get("redirectUri") as string) || "/";
      push(redirectUrl as Route);
    } catch (error) {
      setError("root", {
        message: "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
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
