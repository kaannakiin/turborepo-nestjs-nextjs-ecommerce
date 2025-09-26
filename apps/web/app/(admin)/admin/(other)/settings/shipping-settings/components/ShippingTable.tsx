"use client";

import { Button, Text } from "@mantine/core";
import { useRouter } from "next/navigation";

const ShippingTable = () => {
  const { push } = useRouter();
  return (
    <>
      <div>
        <Text>Henüz bir kargo eklemediniz</Text>
        <Button onClick={() => push("/admin/settings/shipping-settings/new")}>
          Kargo Ekle
        </Button>
      </div>
    </>
  );
};

export default ShippingTable;
