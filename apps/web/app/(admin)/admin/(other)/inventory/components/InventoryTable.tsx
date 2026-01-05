"use client";

import { ActionIcon, Badge, Group, Table, Text, Tooltip } from "@mantine/core";
import {
  getInventoryLocationTypeColor,
  getInventoryLocationTypeLabel,
} from "@repo/shared";
import { AdminInventoryTableReturnType } from "@repo/types";
import {
  IconEdit,
  IconMapPin,
  IconPackage,
  IconTruck,
} from "@tabler/icons-react";
import { Route } from "next";
import { useRouter } from "next/navigation";

interface InventoryTableProps {
  data: AdminInventoryTableReturnType;
}
const InventoryTable = ({ data }: InventoryTableProps) => {
  const router = useRouter();
  const getLocationText = (
    item: AdminInventoryTableReturnType["data"][number]
  ) => {
    const parts: string[] = [];

    if (item.district?.name) parts.push(item.district.name);
    if (item.city?.name) parts.push(item.city.name);
    if (item.state?.name) parts.push(item.state.name);

    const countryName = item.country?.translations?.find(
      (t) => t.locale === "TR"
    )?.name;
    if (countryName) parts.push(`${item.country?.emoji || ""} ${countryName}`);

    return parts.join(", ") || "-";
  };

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Lokasyon Adı</Table.Th>
            <Table.Th>Tür</Table.Th>
            <Table.Th>Konum</Table.Th>
            <Table.Th>Stok Sayısı</Table.Th>
            <Table.Th>Servis Bölgesi</Table.Th>
            <Table.Th>Durum</Table.Th>
            <Table.Th style={{ width: 80 }}>İşlemler</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.data.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Group gap="sm">
                  <div>
                    <Text fw={500} size="sm">
                      {item.name}
                    </Text>
                    {item.contactName && (
                      <Text size="xs" c="dimmed">
                        {item.contactName}
                      </Text>
                    )}
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={getInventoryLocationTypeColor(item.type)}
                  variant="light"
                  size="sm"
                >
                  {getInventoryLocationTypeLabel(item.type)}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <IconMapPin size={14} color="gray" />
                  <Text size="sm" lineClamp={1} style={{ maxWidth: 200 }}>
                    {getLocationText(item)}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Tooltip label="Stok kalemi sayısı">
                  <Group gap="xs">
                    <IconPackage size={14} color="gray" />
                    <Text size="sm">{item._count.inventoryLevels}</Text>
                  </Group>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                <Tooltip label="Servis bölgesi sayısı">
                  <Group gap="xs">
                    <IconTruck size={14} color="gray" />
                    <Text size="sm">{item._count.serviceZones}</Text>
                  </Group>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={item.isActive ? "green" : "gray"}
                  variant="dot"
                  size="sm"
                >
                  {item.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </Table.Td>
              <Table.Td onClick={(e) => e.stopPropagation()}>
                <ActionIcon
                  onClick={() =>
                    router.push(`/admin/inventory/location/${item.id}` as Route)
                  }
                  variant="subtle"
                  size={"md"}
                >
                  <IconEdit />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default InventoryTable;
