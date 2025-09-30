"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import {
  Button,
  Group,
  Radio,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TokenPayload, UserDbAddressType } from "@repo/types";
import { IconArrowNarrowLeft, IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import AuthUserAddressForm from "./AuthUserAddressForm";

type ViewType = "list" | "add" | "edit";

interface AuthUserAddressListProps {
  cartId: string;
  userInfo: TokenPayload;
  addresses: Array<UserDbAddressType & { isDefault: boolean }>;
  refetch: () => void;
}

const AuthUserAddressList = ({
  cartId,
  userInfo,
  addresses,
  refetch,
}: AuthUserAddressListProps) => {
  const { media } = useTheme();
  const [view, setView] = useState<ViewType>("list");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [editingAddress, setEditingAddress] =
    useState<UserDbAddressType | null>(null);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses]);

  const handleEditClick = (address: UserDbAddressType) => {
    setEditingAddress(address);
    setView("edit");
  };

  const handleBackToList = () => {
    setView("list");
    setEditingAddress(null);
  };

  return (
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
      <Stack gap={"xs"} className="flex-1 w-full">
        <Stack gap={"sm"} pl={media === "desktop" ? 40 : 0} className="w-full">
          <Text fz={"lg"}>Teslimat Adresi</Text>
          {addresses && addresses.length > 0 && view === "list" && (
            <Stack gap="sm" style={{ width: "100%" }}>
              <Radio.Group
                value={selectedAddressId}
                onChange={setSelectedAddressId}
                style={{ width: "100%" }}
              >
                <Stack gap="sm" style={{ width: "100%" }}>
                  {addresses.map((addres) => (
                    <Radio.Card
                      key={addres.id}
                      value={addres.id}
                      bg={"#F7F7F9"}
                      className="border-gray-900 border-2"
                      withBorder
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
                        <UnstyledButton
                          className="underline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditClick(addres);
                            setSelectedAddressId(addres.id);
                          }}
                        >
                          Düzenle
                        </UnstyledButton>
                      </Group>
                      <Stack pl={"xl"} gap={"xs"}>
                        <Text fz={"sm"} c={"dimmed"} fw={700} tt={"capitalize"}>
                          {addres.name} {addres.surname}
                        </Text>
                        <Text fz={"sm"} c={"dimmed"}>
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

              <Radio.Card
                withBorder
                className="border-gray-400 border"
                p="md"
                onClick={() => setView("add")}
                style={{ cursor: "pointer" }}
              >
                <Group gap={"lg"}>
                  <Radio.Indicator color="black" checked={false} />
                  <Text fw={700} fz={"md"}>
                    Yeni Adres Ekle
                  </Text>
                </Group>
              </Radio.Card>
            </Stack>
          )}

          {(view === "add" || view === "edit") && (
            <Stack gap="sm" style={{ width: "100%" }}>
              <UnstyledButton
                className="flex flex-row gap-1 items-center hover:underline hover:underline-offset-4"
                onClick={handleBackToList}
              >
                <IconArrowNarrowLeft />
                Geri
              </UnstyledButton>
              <AuthUserAddressForm
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
                      }
                    : undefined
                }
                onSubmit={async (data) => {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/locations/add-user-address`,
                    {
                      method: "POST",
                      credentials: "include",
                      body: JSON.stringify(data),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  if (!res.ok) {
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
          >
            {"Kargo ile Devam Et"}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AuthUserAddressList;
