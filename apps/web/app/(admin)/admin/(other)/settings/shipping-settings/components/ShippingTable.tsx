"use client";

import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { DateFormatter, useQuery } from "@repo/shared";
import { CargoZones } from "@repo/types";
import { IconEdit } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const ShippingTable = () => {
  const { push } = useRouter();

  const { isLoading, isPending, isFetching, data } = useQuery({
    queryKey: ["get-all-cargo-zones"],
    queryFn: async () => {
      const req = await fetchWrapper.get<{
        success: boolean;
        cargoZones: Array<CargoZones>;
      }>(`/shipping/get-all-cargo-zones`, {});
      if (!req.success) {
        return null;
      }

      if (!req.data.success) {
        return null;
      }
      return req.data.cargoZones;
    },
    refetchOnMount: false,
  });
  if (isLoading || isPending || isFetching) {
    return <GlobalLoadingOverlay />;
  }
  const dataExists = data && data.length > 0;

  return (
    <>
      <Card withBorder>
        <Card.Section className="border-b-gray-400">
          <Group p={"md"} justify="space-between" align="center">
            <Stack gap={"xs"}>
              <Title order={4}>Kurallar</Title>
              <Text>
                Kargo fiyatlarınızı ve ücretsiz kargo şartlarınızı buradan
                belirleyebilirsiniz.
              </Text>
            </Stack>
            {dataExists && (
              <Button
                variant="outline"
                onClick={() => {
                  push("/admin/settings/shipping-settings/new");
                }}
              >
                Yeni Kargo Seti Ekle
              </Button>
            )}
          </Group>
        </Card.Section>
        <Card.Section>
          {dataExists ? (
            <Table.ScrollContainer minWidth={800} py={"md"}>
              <Table
                highlightOnHover
                highlightOnHoverColor="admin.0"
                verticalSpacing={"sm"}
              >
                <Table.Thead bg="gray.2">
                  <Table.Tr>
                    <Table.Th>Kargo Bölgesi</Table.Th>
                    <Table.Th>Kural Sayısı</Table.Th>
                    <Table.Th>Oluşturma Tarihi</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.map((zone) => (
                    <Table.Tr key={zone.id}>
                      <Table.Td maw={180}>
                        <Group gap={"xs"} wrap="wrap">
                          {zone.locations.slice(0, 5).map((loc) => (
                            <Badge radius={0} variant="outline" key={loc.id}>
                              {loc.country.emoji}{" "}
                              {loc.country.translations[0]?.name ||
                                loc.country.name}
                            </Badge>
                          ))}
                          {zone.locations.length > 5 && (
                            <Badge radius={0} variant="filled" color="gray">
                              +{zone.locations.length - 5} daha
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>{zone.rules.length} kural</Table.Td>
                      <Table.Td>
                        <Text>{DateFormatter.withDay(zone.createdAt)}</Text>
                      </Table.Td>
                      <Table.Td align="right">
                        <ActionIcon
                          variant="transparent"
                          size="md"
                          onClick={() =>
                            push(`/admin/settings/shipping-settings/${zone.id}`)
                          }
                        >
                          <IconEdit />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <div className="flex items-center justify-center flex-col gap-3 py-5 bg-gray-100">
              <Text>Henüz bir kargo bölgesi oluşturulmamış.</Text>
              <Button
                onClick={() => {
                  push("/admin/settings/shipping-settings/new");
                }}
              >
                Yeni Kargo Seti Ekle
              </Button>
            </div>
          )}
        </Card.Section>
      </Card>
    </>
  );
};

export default ShippingTable;
