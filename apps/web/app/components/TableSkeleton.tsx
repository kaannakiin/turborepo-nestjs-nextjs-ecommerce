"use client";

import { Skeleton, Table } from "@mantine/core";

interface TableSkeletonProps {
  lenght?: number;
}
const TableSkeleton = ({ lenght = 5 }: TableSkeletonProps) => {
  return Array.from({ length: lenght }).map((_, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Skeleton height={20} width={150} radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={20} width={80} radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={20} width={100} radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={20} width={50} radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={20} width={120} radius="xl" />
      </Table.Td>
      <Table.Td>
        <Skeleton height={20} width={60} radius="xl" />
      </Table.Td>
    </Table.Tr>
  ));
};

export default TableSkeleton;
