"use client";
import { TURKEY_DB_ID } from "@lib/constants";
import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import { ShippingAddressPayload } from "@repo/types";
import {
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import FormCard from "../../store/discounts/components/FormCard";

interface AdminOrderAddressCardProps {
  shippingAddress: ShippingAddressPayload;
  title?: string;
  isBilling?: boolean;
}

const AdminOrderAddressCard = ({
  shippingAddress,
  title = "Teslimat Adresi",
  isBilling = false,
}: AdminOrderAddressCardProps) => {
  const isTurkey = shippingAddress.countryId === TURKEY_DB_ID;

  const getFullAddress = () => {
    const parts = [];

    if (shippingAddress.addressLine1) {
      parts.push(shippingAddress.addressLine1);
    }
    if (shippingAddress.addressLine2) {
      parts.push(shippingAddress.addressLine2);
    }

    if (isTurkey && shippingAddress.district) {
      parts.push(shippingAddress.district.name);
    }

    const locationParts = [];
    if (shippingAddress.city?.name) {
      locationParts.push(shippingAddress.city.name);
    }
    if (shippingAddress.state?.name) {
      locationParts.push(shippingAddress.state.name);
    }

    if (locationParts.length > 0) {
      parts.push(locationParts.join(" / "));
    }

    if (!isTurkey) {
      const countryName =
        shippingAddress.country?.name ||
        shippingAddress.country?.translations?.[0]?.name;
      if (countryName) {
        parts.push(
          `${shippingAddress.country?.emoji || ""} ${countryName}`.trim()
        );
      }
    }

    if (shippingAddress.zipCode) {
      parts.push(`PK: ${shippingAddress.zipCode}`);
    }

    return parts.join(", ");
  };

  return (
    <FormCard
      title={
        <Group p={"md"} gap="xs">
          <IconMapPin size={18} />
          <Title order={4}>{title}</Title>
          {shippingAddress.addressTitle && !isBilling && (
            <Badge color="gray" size="md">
              {shippingAddress.addressTitle}
            </Badge>
          )}
        </Group>
      }
    >
      {isBilling && shippingAddress.isCorporateInvoice && (
        <Badge
          variant="light"
          color="blue"
          size="md"
          leftSection={<IconBuilding size={14} />}
        >
          Kurumsal Fatura
        </Badge>
      )}

      {isBilling &&
        shippingAddress.isCorporateInvoice &&
        shippingAddress.companyName && (
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {shippingAddress.companyName}
            </Text>
            {shippingAddress.taxNumber && (
              <Text size="xs" c="dimmed">
                Vergi No: {shippingAddress.taxNumber}
              </Text>
            )}
            {shippingAddress.companyRegistrationAddress && (
              <Text size="xs" c="dimmed">
                Vergi Dairesi: {shippingAddress.companyRegistrationAddress}
              </Text>
            )}
          </Stack>
        )}

      <Group gap="xs" wrap="nowrap">
        <IconUser size={16} color="gray" />
        <Text size="sm" fw={500}>
          {shippingAddress.name} {shippingAddress.surname}
        </Text>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <IconPhone size={16} color="gray" />
        <Text size="sm">{shippingAddress.phone}</Text>
      </Group>

      {shippingAddress.tcKimlikNo && (
        <Text size="sm" pl={24}>
          TC: {shippingAddress.tcKimlikNo}
        </Text>
      )}

      <Group gap="xs" wrap="nowrap" align="flex-start">
        <IconMapPin size={16} color="gray" style={{ marginTop: 2 }} />
        <Text size="sm" style={{ lineHeight: 1.5 }}>
          {getFullAddress()}
        </Text>
      </Group>
    </FormCard>
  );
};

export default AdminOrderAddressCard;
