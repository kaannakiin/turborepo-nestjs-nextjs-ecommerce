"use client";

import { Card, Divider, Stack, Title } from "@mantine/core";
import { ReactNode } from "react";

const ProductDetailCard = ({ children }: { children: ReactNode }) => {
  return (
    <Card withBorder>
      <Card.Section>
        <Title order={4} p={"md"}>
          Ürün Detayı
        </Title>
        <Divider mt={"sm"} />
      </Card.Section>
      <Stack gap={"md"} py={"md"}>
        {children}
      </Stack>
    </Card>
  );
};

export default ProductDetailCard;
