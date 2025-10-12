"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { Button, Card, Group, SimpleGrid, TextInput } from "@mantine/core";
import {
  Controller,
  SubmitHandler,
  useForm,
  useQuery,
  zodResolver,
} from "@repo/shared";
import {
  TokenPayload,
  UserDashboardInfoSchema,
  UserDashboardInfoType,
} from "@repo/types";
import { useRouter } from "next/navigation";
import CustomPhoneInput from "../components/CustomPhoneInput";
import { useEffect } from "react";
import { notifications } from "@mantine/notifications";

const DashboardPage = () => {
  const { push } = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetchWrapper.get<TokenPayload>("/auth/me");
      if (!res.success) {
        return null;
      }
      return res.data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = useForm<UserDashboardInfoType>({
    resolver: zodResolver(UserDashboardInfoSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: null,
      phone: "",
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name.split(" ")[0] || "",
        surname: data.name.split(" ").slice(-1)[0] || "",
        email: data.email || null,
        phone: data.phone || "",
      });
    }
  }, [data, reset]); // reset'i ekledik
  if (isLoading || isSubmitting) {
    return <GlobalLoadingOverlay />;
  }

  if (!data) {
    push("/auth?redirectUri=/dashboard");
  }
  const onSubmit: SubmitHandler<UserDashboardInfoType> = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    notifications.show({
      title: "Başarılı",
      message: "Bilgileriniz güncellendi",
      color: "green",
    });
  };

  return (
    <Card withBorder p={"md"} className="max-w-3xl mx-auto w-full gap-3">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <SimpleGrid
          cols={{
            xs: 1,
            md: 2,
          }}
        >
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                error={fieldState.error?.message}
                label="İsim"
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
                label="Soyisim"
                size="md"
                radius={"md"}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <CustomPhoneInput
                {...field}
                error={fieldState.error?.message}
                label="Telefon Numarası"
                size="md"
                radius={"md"}
                disabled
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <TextInput
                type="email"
                {...field}
                error={fieldState.error?.message}
                label="E-Posta"
                size="md"
                radius={"md"}
                disabled
              />
            )}
          />
        </SimpleGrid>
        <Group justify="center">
          <Button type="submit" size="md" radius={"md"}>
            Güncelle
          </Button>
        </Group>
      </form>
    </Card>
  );
};

export default DashboardPage;
