"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import GlobalLoader from "@/components/GlobalLoader";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import {
  Button,
  Divider,
  Group,
  Radio,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@repo/shared";
import { TokenPayload, UserDbAddressType } from "@repo/types";
import { IconCheck } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const AuthUserAddressForm = dynamic(() => import("./AuthUserAddressForm"), {
  ssr: false,
  loading: () => <GlobalLoader />,
});

type ViewType = "list" | "add" | "edit";

interface AuthUserAddressListProps {
  cartId: string;
  userInfo: TokenPayload;
}

const AuthUserAddressList = ({
  cartId,
  userInfo,
}: AuthUserAddressListProps) => {
  const { data, isLoading, isPending, refetch } = useQuery({
    queryKey: ["users-address", userInfo.id],
    queryFn: async () => {
      const res = await fetchWrapper.get<
        Array<UserDbAddressType & { isDefault: boolean }>
      >(`/locations/get-user-addresses`);
      if (!res.success) {
        notifications.show({
          title: "Adresler yüklenemedi",
          message: "Lütfen sayfayı yenileyip tekrar deneyin.",
          color: "red",
        });
        return [];
      }

      return res.data;
    },
    enabled: !!userInfo.id,
  });

  const { media } = useTheme();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [view, setView] = useState<ViewType>("list");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [editingAddress, setEditingAddress] =
    useState<UserDbAddressType | null>(null);

  // ÇÖZÜM: Form'u yeniden mount etmek için unique key
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (data && data.length > 0) {
      const defaultAddress = data.find((addr) => addr.isDefault);
      setSelectedAddressId(defaultAddress?.id || data[0]?.id || null);
    }
  }, [data]);

  const handleEditClick = (address: UserDbAddressType) => {
    setEditingAddress(address);
    setView("edit");
    setFormKey((prev) => prev + 1); // Form'u yeniden mount et
  };

  const handleBackToList = () => {
    setView("list");
    setEditingAddress(null);
    setFormKey((prev) => prev + 1); // Formu temizle
  };

  const handleRadioChange = (value: string) => {
    setSelectedAddressId(value);
    setView("list");
    setEditingAddress(null);
  };

  const handleAddNewAddress = () => {
    setView("add");
    setSelectedAddressId(null);
    setEditingAddress(null);
    setFormKey((prev) => prev + 1); // Yeni form için key güncelle
  };

  return (
    <Stack gap={"xl"}>
      {(isLoading || isPending || loading) && <GlobalLoadingOverlay />}

      <Stack gap={"sm"} align="start">
        <Group align="center" gap={"sm"}>
          <ThemeIcon radius={"xl"} color="black" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"}>
              1
            </Text>
          </ThemeIcon>
          <Text fz={"lg"} fw={600}>
            Adres
          </Text>
        </Group>
        <Stack
          gap={"sm"}
          pl={media === "desktop" ? 40 : 0}
          className="w-full flex-1"
        >
          <Text fz={"lg"}>Teslimat Adresi</Text>

          <Stack gap="sm" style={{ width: "100%" }}>
            <Radio.Group
              value={selectedAddressId}
              onChange={handleRadioChange}
              style={{ width: "100%" }}
            >
              <Stack gap="sm" style={{ width: "100%" }}>
                {data &&
                  data.length > 0 &&
                  data.map((addres) => (
                    <Radio.Card
                      key={addres.id}
                      value={addres.id}
                      bg={"#F7F7F9"}
                      className={
                        selectedAddressId === addres.id
                          ? "border-gray-900 border-2"
                          : "border border-gray-400"
                      }
                      p="md"
                      style={{ width: "100%" }}
                    >
                      <Group gap={"md"} align="center" justify="space-between">
                        <Group gap={"xs"} align="center">
                          <Radio.Indicator
                            icon={IconCheck}
                            color="black"
                            classNames={{
                              icon: "size-5",
                            }}
                          />
                          <Text tt={"capitalize"} fz={"sm"}>
                            {addres.addressTitle}
                          </Text>
                        </Group>
                        <Text
                          fw={600}
                          c={
                            selectedAddressId === addres.id ? "black" : "dimmed"
                          }
                          className="hover:underline hover:underline-offset-4 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditClick(addres);
                            setSelectedAddressId(null);
                          }}
                        >
                          Düzenle
                        </Text>
                      </Group>
                      <Stack pl={"xl"} gap={"1px"}>
                        <Text
                          fz={"sm"}
                          c={
                            selectedAddressId === addres.id ? "black" : "dimmed"
                          }
                          fw={700}
                          tt={"capitalize"}
                        >
                          {addres.name} {addres.surname}
                        </Text>
                        <Text
                          fz={"sm"}
                          fw={600}
                          c={
                            selectedAddressId === addres.id ? "black" : "dimmed"
                          }
                        >
                          {addres.addressLine1}
                          {addres.addressLine2 && ` ${addres.addressLine2}`}
                          {addres.addressLocationType === "CITY" &&
                          addres.city ? (
                            <>
                              {" "}
                              - {addres.city.name} / {addres.country.name}
                            </>
                          ) : addres.addressLocationType === "STATE" &&
                            addres.state ? (
                            <>
                              {" "}
                              - {addres.state.name} / {addres.country.name}
                            </>
                          ) : (
                            <> - {addres.country.name}</>
                          )}
                        </Text>
                      </Stack>
                    </Radio.Card>
                  ))}
              </Stack>
            </Radio.Group>

            {view === "list" && (
              <Radio.Card
                withBorder
                className="border-gray-400 border"
                p="md"
                onClick={handleAddNewAddress}
                style={{ cursor: "pointer" }}
              >
                <Group gap={"lg"}>
                  <Radio.Indicator color="black" checked={false} />
                  <Text fw={700} fz={"md"}>
                    Yeni Adres Ekle
                  </Text>
                </Group>
              </Radio.Card>
            )}
          </Stack>

          {(view === "add" || view === "edit") && (
            <Stack gap="sm" style={{ width: "100%" }}>
              <AuthUserAddressForm
                key={formKey} // ÇÖZÜM: Her değişiklikte formu yeniden mount et
                defaultValues={
                  view === "edit" && editingAddress
                    ? {
                        id: editingAddress.id,
                        phone: editingAddress.phone,
                        name: editingAddress.name,
                        surname: editingAddress.surname,
                        countryId: editingAddress.countryId,
                        addressType: editingAddress.addressLocationType,
                        addressLine1: editingAddress.addressLine1,
                        addressTitle: editingAddress.addressTitle,
                        cityId: editingAddress.cityId || undefined,
                        stateId: editingAddress.stateId || undefined,
                        addressLine2: editingAddress.addressLine2 || undefined,
                        postalCode: editingAddress.zipCode || undefined,
                        tcKimlikNo: editingAddress.tcKimlikNo || undefined,
                      }
                    : undefined
                }
                onSubmit={async (data) => {
                  const res = await fetchWrapper.post(
                    `/locations/add-user-address`,
                    data
                  );
                  if (!res.success) {
                    notifications.show({
                      title:
                        view === "edit"
                          ? "Adres güncellenemedi"
                          : "Adres eklenemedi",
                      message:
                        "Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
                      color: "red",
                    });
                    return;
                  }
                  notifications.show({
                    title:
                      view === "edit" ? "Adres güncellendi" : "Adres eklendi",
                    message:
                      view === "edit"
                        ? "Adresiniz başarıyla güncellendi."
                        : "Yeni adresiniz başarıyla eklendi.",
                    color: "green",
                  });
                  handleBackToList();
                  refetch();
                }}
              />
            </Stack>
          )}

          <Button
            fullWidth
            size="lg"
            radius={"md"}
            variant="filled"
            color="black"
            onClick={async () => {
              if (!selectedAddressId) {
                notifications.show({
                  title: "Adres seçilmedi",
                  message: "Lütfen bir adres seçin veya yeni adres ekleyin.",
                });

                return;
              }

              try {
                setLoading(true);
                const res = await fetchWrapper.post<{
                  success: boolean;
                  message: string;
                }>(`/cart-v3/update-cart-address`, {
                  cartId,
                  addressId: selectedAddressId,
                });
                if (!res.success || !res.data.success) {
                  notifications.show({
                    title: "Adres seçilemedi",
                    message: "Lütfen tekrar deneyin.",
                    color: "red",
                  });
                  return;
                }
                notifications.show({
                  title: "Adres seçildi",
                  message: "Adresiniz başarıyla seçildi.",
                  color: "green",
                });
                const params = new URLSearchParams(searchParams.toString());
                params.set("step", "shipping");
                replace(`?${params.toString()}`);
                return;
              } catch (error) {
                notifications.show({
                  title: "Adres seçilemedi",
                  message: "Lütfen tekrar deneyin.",
                  color: "red",
                });
                return;
              } finally {
                setLoading(false);
              }
            }}
          >
            {"Kargo ile Devam Et"}
          </Button>
        </Stack>
      </Stack>
      <Divider size={"md"} />
      <Group gap={"xl"}>
        <Group align="center" gap={"sm"}>
          <ThemeIcon radius={"xl"} color="gray.3" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"} c={"dimmed"}>
              2
            </Text>
          </ThemeIcon>
          <Text fz={"lg"} fw={600} c={"dimmed"}>
            Kargo
          </Text>
        </Group>
      </Group>
      <Divider size={"md"} />
      <Group gap={"xl"}>
        <Group align="center" gap={"sm"}>
          <ThemeIcon radius={"xl"} color="gray.3" size={"lg"}>
            <Text fz={"xl"} fw={700} ta={"center"} c={"dimmed"}>
              3
            </Text>
          </ThemeIcon>
          <Text fz={"lg"} fw={600} c={"dimmed"}>
            Ödeme
          </Text>
        </Group>
      </Group>
    </Stack>
  );
};

export default AuthUserAddressList;
