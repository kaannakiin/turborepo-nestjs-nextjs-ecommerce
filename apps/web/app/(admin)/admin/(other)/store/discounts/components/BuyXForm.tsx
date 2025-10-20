"use client";

import { InputDescription, Stack, Title } from "@mantine/core";
import FormCard from "./FormCard";

const BuyXForm = () => {
  return (
    <FormCard
      title={
        <Stack gap={"xs"} p={"md"}>
          <Title order={4}>Müşterinin Kazandıkları</Title>
          <InputDescription>
            Kampanya, müşterinin belirli ürünleri satın aldığında indirimlerden
            yararlanmasını sağlar.
          </InputDescription>
        </Stack>
      }
    >
      BuyXForm
    </FormCard>
  );
};

export default BuyXForm;
