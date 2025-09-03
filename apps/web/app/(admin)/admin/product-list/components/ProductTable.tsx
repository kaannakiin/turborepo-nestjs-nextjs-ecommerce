"use client";
import { Table } from "@mantine/core";
import React from "react";

const ProductTable = () => {
  return (
    <Table.ScrollContainer minWidth={800}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Element position</Table.Th>
            <Table.Th>Element name</Table.Th>
            <Table.Th>Symbol</Table.Th>
            <Table.Th>Atomic mass</Table.Th>
          </Table.Tr>
        </Table.Thead>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ProductTable;
