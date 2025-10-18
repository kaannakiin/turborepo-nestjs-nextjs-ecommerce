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
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  Controller,
  Form,
  SubmitHandler,
  useForm,
  zodResolver,
} from "@repo/shared";
import { $Enums, MainDiscount, MainDiscountSchema } from "@repo/types";
import {
  IconCurrencyLira,
  IconGift,
  IconPercentage,
  IconTruckDelivery,
} from "@tabler/icons-react";
interface DiscountFormProps {
  defaultValues?: MainDiscount;
}
const getIcon = (type: $Enums.DiscountType) => {
  switch (type) {
    case "BUY_X_GET_Y":
      return <IconGift />;
    case "PERCENTAGE":
      return <IconPercentage />;
    case "FIXED_AMOUNT":
      return <IconCurrencyLira />;
    case "FREE_SHIPPING":
      return <IconTruckDelivery />;
  }
};

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
  const { control, handleSubmit, watch } = useForm<MainDiscount>({
    resolver: zodResolver(MainDiscountSchema),
    defaultValues: defaultValues || {
      type: "PERCENTAGE",
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
  const discountType = watch("type") || "PERCENTAGE";

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
        <SimpleGrid py={"md"} cols={1} spacing="sm">
          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <Radio.Group {...field} error={fieldState.error?.message}>
                <SimpleGrid
                  cols={{
                    base: 2,
                    md: 4,
                  }}
                >
                  {Object.values($Enums.DiscountType).map(
                    (discountType, idx) => (
                      <Radio.Card
                        key={idx}
                        value={discountType}
                        className={`border border-gray-400 rounded-xl ${field.value.toUpperCase() === discountType ? "bg-[var(--mantine-primary-color-1)] " : ""}`}
                        p="md"
                      >
                        <Group
                          gap={"xs"}
                          justify="space-between"
                          align="center"
                        >
                          <Group gap={"xs"}>
                            <ThemeIcon
                              className="text-center"
                              variant={
                                field.value.toUpperCase() === discountType
                                  ? "filled"
                                  : "light"
                              }
                              radius={"lg"}
                              size={"lg"}
                            >
                              {getIcon(discountType as $Enums.DiscountType)}
                            </ThemeIcon>
                            <Text>
                              {getDiscountTypeLabel(
                                discountType as $Enums.DiscountType
                              )}
                            </Text>
                          </Group>
                          <Radio.Indicator />
                        </Group>
                      </Radio.Card>
                    )
                  )}
                </SimpleGrid>
              </Radio.Group>
            )}
          />
        </SimpleGrid>
      </FormCard>
      {(discountType === "PERCENTAGE" || discountType === "FIXED_AMOUNT") && (
        <FormCard title="İndirim Oranı">
          <Controller
            control={control}
            name="isGrowDiscount"
            render={({ field, fieldState }) => (
              <Radio.Group
                onChange={(e) => {
                  field.onChange(e === "true" ? true : false);
                }}
                error={fieldState.error?.message}
              >
                <Radio.Card value="true">Evet</Radio.Card>
                <Radio.Card value="false">Hayır</Radio.Card>
              </Radio.Group>
            )}
          />
        </FormCard>
      )}
    </Stack>
  );
};

export default DiscountForm;
