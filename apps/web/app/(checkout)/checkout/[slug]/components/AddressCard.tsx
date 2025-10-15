"use client";
import {
  Box,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { GetUserCartInfoForCheckoutReturn } from "@repo/types";
import { IconCheck } from "@tabler/icons-react";

interface AddressCardProps {
  data: GetUserCartInfoForCheckoutReturn["shippingAddress"];
  onEdit?: () => void;
}

const AddressCard = ({ data, onEdit }: AddressCardProps) => {
  if (!data) return null;
  return (
    <>
      <Box hiddenFrom="sm">
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm" align="center">
            <ThemeIcon radius="xl" color="black" size="lg">
              <IconCheck />
            </ThemeIcon>
            <Text fw={600} size="lg">
              Adres
            </Text>
          </Group>
          <UnstyledButton
            onClick={onEdit}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#666",
              backgroundColor: "transparent",
            }}
          >
            Düzenle
          </UnstyledButton>
        </Group>

        <Stack gap="1px" pl={0}>
          {data.email && (
            <Text size="sm" c="dimmed">
              {data.email}
            </Text>
          )}
          <Text fw={500}>
            {data.name} {data.surname}
          </Text>
          <Text size="sm" c="dimmed">
            {data.phone}
          </Text>
          <Text size="sm" c="dimmed">
            {data.addressLine1}
            {data.addressLine2 && `, ${data.addressLine2}`}
          </Text>
        </Stack>
      </Box>

      <Box visibleFrom="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="center">
            <ThemeIcon radius="xl" color="black" size="lg">
              <IconCheck />
            </ThemeIcon>
            <Text fw={600} size="lg">
              Adres
            </Text>
          </Group>

          <Stack gap="1px" style={{ flex: 1, marginLeft: "2rem" }}>
            {data.email && (
              <Text size="sm" c="dimmed">
                {data.email}
              </Text>
            )}
            <Text fw={500}>
              {data.name} {data.surname}
            </Text>
            <Text size="sm" c="dimmed">
              {data.phone}
            </Text>
            {data.addressLocationType === "CITY" ? (
              <Text size="sm" c="dimmed">
                {data.city?.name} / {data.country.translations[0].name}
              </Text>
            ) : data.addressLocationType === "STATE" ? (
              <Text size="sm" c="dimmed">
                {data.state?.name} / {data.country.translations[0].name}
              </Text>
            ) : null}
            <Text size="sm" c="dimmed">
              {data.district?.name || ""} {data.addressLine1}
              {data.addressLine2 && `, ${data.addressLine2}`}
            </Text>
          </Stack>

          <UnstyledButton
            onClick={onEdit}
            className="hover:text-black transition-colors hover:underline hover:underline-offset-4 text-gray-500"
          >
            Düzenle
          </UnstyledButton>
        </Group>
      </Box>
    </>
  );
};

export default AddressCard;
