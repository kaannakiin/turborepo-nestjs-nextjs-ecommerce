"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  ActionIcon,
  Button,
  Group,
  Radio,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Control, Controller, UseFormSetValue, useQuery } from "@repo/shared";
import { AllUsersReturnType, MainDiscount } from "@repo/types";
import { IconTrash, IconUser, IconUsers } from "@tabler/icons-react";
import DiscountModal from "./DiscountModal";
import FormCard from "./FormCard";

interface DiscountCustomerFormProps {
  control: Control<MainDiscount>;
  allCustomers: boolean;
  selectedCustomers: string[];
  setValue: UseFormSetValue<MainDiscount>;
}

const DiscountCustomerForm = ({
  control,
  allCustomers,
  selectedCustomers = [],
  setValue,
}: DiscountCustomerFormProps) => {
  const [opened, { open, close }] = useDisclosure();

  const { data, isLoading } = useQuery({
    queryKey: ["discount-form-customers"],
    queryFn: async () => {
      const res = await fetchWrapper.get<AllUsersReturnType[]>(
        "/admin/users/all-users"
      );
      if (!res || !res.success) {
        return [];
      }
      return res.data;
    },
    enabled: !allCustomers,
  });

  const handleRemoveCustomer = (customerId: string) => {
    const updatedCustomers = selectedCustomers.filter(
      (id) => id !== customerId
    );
    setValue("otherCustomers", updatedCustomers);
  };

  const handleEditCustomers = () => {
    if (!allCustomers && data && data.length > 0) open();
  };

  return (
    <>
      <FormCard title="Müşteriler">
        <Controller
          control={control}
          name="allCustomers"
          render={({ field: { onChange, value, ...field }, fieldState }) => (
            <Radio.Group
              {...field}
              value={value ? "all" : "specific"}
              onChange={(val) => {
                const isAll = val === "all";
                onChange(isAll);
                if (isAll) {
                  setValue("otherCustomers", null);
                }
              }}
              error={fieldState.error?.message}
            >
              <SimpleGrid cols={{ base: 1, md: 4 }}>
                <Radio.Card
                  className={`border border-gray-400 rounded-xl ${
                    value ? "bg-[var(--mantine-primary-color-1)]" : ""
                  }`}
                  p="md"
                  value="all"
                >
                  <Group justify="space-between" align="center">
                    <Group gap={"xs"}>
                      <ThemeIcon
                        className="text-center"
                        variant={value ? "filled" : "light"}
                        radius={"lg"}
                        size={"lg"}
                      >
                        <IconUsers />
                      </ThemeIcon>
                      <Text fz={"sm"}>Tüm Müşteriler</Text>
                    </Group>
                    <Radio.Indicator />
                  </Group>
                </Radio.Card>
                <Radio.Card
                  className={`border border-gray-400 rounded-xl ${
                    !value ? "bg-[var(--mantine-primary-color-1)]" : ""
                  }`}
                  p="md"
                  value="specific"
                >
                  <Group justify="space-between" align="center">
                    <Group gap={"xs"}>
                      <ThemeIcon
                        className="text-center"
                        variant={!value ? "filled" : "light"}
                        radius={"lg"}
                        size={"lg"}
                      >
                        <IconUser />
                      </ThemeIcon>
                      <Text fz={"sm"}>Belirli Müşteriler</Text>
                    </Group>
                    <Radio.Indicator />
                  </Group>
                </Radio.Card>
              </SimpleGrid>
            </Radio.Group>
          )}
        />
        <Stack gap={"xs"}>
          {!allCustomers && (
            <Group gap={"xs"}>
              <Button
                onClick={() => {
                  if (!allCustomers && data && data.length > 0) open();
                }}
              >
                Müşteri Seç
              </Button>
              {selectedCustomers && selectedCustomers.length > 0 && (
                <Button variant="light" onClick={handleEditCustomers}>
                  Düzenle
                </Button>
              )}
            </Group>
          )}
          {!allCustomers &&
            data &&
            data.length > 0 &&
            selectedCustomers &&
            selectedCustomers.length > 0 && (
              <ScrollArea h={200}>
                <Stack gap="xs">
                  {selectedCustomers.map((customerId) => {
                    const customer = data.find(
                      (user) => user.id === customerId
                    );
                    if (!customer) return null;
                    return (
                      <Group
                        key={customer.id}
                        justify="space-between"
                        p="xs"
                        className="border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Text fz="sm">
                          {customer.name} {customer.surname} /{" "}
                          {customer.email || customer.phone}
                        </Text>
                        <Tooltip label="Kaldır">
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleRemoveCustomer(customer.id)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
        </Stack>
      </FormCard>
      {!allCustomers && data && data.length > 0 && (
        <DiscountModal
          isLoading={isLoading}
          opened={opened}
          onClose={close}
          dataTitle="Kişi"
          selectedItems={selectedCustomers}
          data={data.map((user) => ({
            id: user.id,
            name: `${user.name} ${user.surname} / ${user.email || user.phone}`,
            sub: [],
          }))}
          modalProps={{
            title: "Müşteri Seç",
          }}
          onSave={(data) => {
            setValue("otherCustomers", data);
            close();
          }}
        />
      )}
    </>
  );
};

export default DiscountCustomerForm;
