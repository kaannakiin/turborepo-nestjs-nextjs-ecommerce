"use client";

import { getDiscountTypeLabel } from "@lib/helpers";
import {
  Card,
  Group,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm, zodResolver } from "@repo/shared";
import { $Enums, MainDiscount, MainDiscountSchema } from "@repo/types";

interface DiscountFormProps {
  defaultValues?: MainDiscount;
}

const FormCard = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <Card withBorder radius={"md"}>
      <Card.Section inheritPadding className="border-b border-gray-400">
        <Title order={5} p="md">
          {title}
        </Title>
      </Card.Section>
      {children}
    </Card>
  );
};

const DiscountForm = ({ defaultValues }: DiscountFormProps) => {
  const { control, handleSubmit } = useForm<MainDiscount>({
    resolver: zodResolver(MainDiscountSchema),
    defaultValues: defaultValues || {
      type: "percentage",
      title: "",
      isAllProducts: true,
      isGrowDiscount: false,
      currencies: ["TRY"],
      conditions: null,
      customerSchema: { allCustomers: true, otherCustomers: null },
      dates: {
        addEndDate: false,
        startDate: null,
        endDate: null,
        addStartDate: false,
      },
      discountValue: 0,
      settings: {
        isLimitTotalUsage: false,
        isLimitTotalUsagePerCustomer: false,
        mergeOtherCampaigns: false,
        totalUsageLimit: null,
        totalUsageLimitPerCustomer: null,
      },
    },
  });

  const onSubmit: SubmitHandler<MainDiscount> = async (data) => {};

  return (
    <Stack gap="lg" className="max-w-5xl flex lg:mx-auto">
      <FormCard title="Başlık">
        <Stack gap={"xs"} py={"md"}>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                withAsterisk
                error={fieldState.error?.message}
                variant="filled"
                label="Başlık"
              />
            )}
          />
        </Stack>
      </FormCard>
      <FormCard title="İndirim türü">
        <SimpleGrid py={"md"}>
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <Radio.Group {...field} error={fieldState.error?.message}>
                {Object.keys($Enums.DiscountType).map((key, idx) => (
                  <Radio.Card key={idx} value={key} withBorder p="md">
                    <Group gap={"xs"}>
                      <Radio.Indicator />
                      <Text>
                        {getDiscountTypeLabel(key as $Enums.DiscountType)}
                      </Text>
                    </Group>
                  </Radio.Card>
                ))}
              </Radio.Group>
            )}
          />
        </SimpleGrid>
      </FormCard>
    </Stack>
  );
};

export default DiscountForm;
