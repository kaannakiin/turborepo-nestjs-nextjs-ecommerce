"use client";

import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import {
  Box,
  Group,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { $Enums } from "@repo/shared";
import { IconCheck } from "@tabler/icons-react";
interface ShippingCardProps {
  onEdit: () => void;
  cartData: {
    price: number;
    methodTitle: string;
    currency: $Enums.Currency;
  };
}
const ShippingCard = ({ onEdit, cartData }: ShippingCardProps) => {
  return (
    <>
      <Box hiddenFrom="sm">
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm" align="center">
            <ThemeIcon radius="xl" color="black" size="lg">
              <IconCheck />
            </ThemeIcon>
            <Text fw={600} size="lg">
              Kargo
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
          <Group gap={"xs"} align="center">
            <Text fz={"sm"}>{cartData.methodTitle}</Text>
            {cartData.price > 0 ? (
              <ProductPriceFormatter
                fz={"sm"}
                c={"dimmed"}
                price={cartData.price}
              />
            ) : (
              <Text fz={"sm"} c={"dimmed"}>
                / Ücretsiz
              </Text>
            )}
          </Group>
        </Stack>
      </Box>

      <Box visibleFrom="sm">
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon radius="xl" color="black" size="lg">
              <IconCheck />
            </ThemeIcon>
            <Text fw={600} size="lg">
              Kargo
            </Text>
          </Group>

          <Stack gap="1px" style={{ flex: 1, marginLeft: "2rem" }}>
            <Group gap={"xs"} align="center">
              <Text fz={"lg"}>{cartData.methodTitle}</Text>
              {cartData.price > 0 ? (
                <ProductPriceFormatter
                  fz={"lg"}
                  c={"dimmed"}
                  price={cartData.price}
                />
              ) : (
                <Text fz={"lg"} c={"dimmed"}>
                  / Ücretsiz
                </Text>
              )}
            </Group>
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

export default ShippingCard;
