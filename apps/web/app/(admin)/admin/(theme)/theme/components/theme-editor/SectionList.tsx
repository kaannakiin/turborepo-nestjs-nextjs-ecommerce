import { Button, Group, Stack, Text } from "@mantine/core";
import { Control, useFieldArray } from "@repo/shared";
import { ThemeInputType } from "@repo/types";
import { IconPlus } from "@tabler/icons-react";
import React from "react";
import NavbarComponentTable from "../navbar/NavbarComponentTable";

interface SectionListProps {
  control: Control<ThemeInputType>;
  onAddClick: () => void;
  activePageIndex: number;
}

const SectionList = ({
  onAddClick,
  control,
  activePageIndex,
}: SectionListProps) => {
  const componentsFieldArray = useFieldArray({
    control: control,
    name: `pages.${activePageIndex}.components`,
    keyName: "rhf_id",
  });

  return (
    <Stack gap={4} px="sm" pb="xl">
      <Group justify="space-between" px="xs" py={4}>
        <Text size="xs" fw={700} c="dimmed">
          BÖLÜMLER ({componentsFieldArray.fields?.length})
        </Text>
      </Group>

      <NavbarComponentTable
        key={activePageIndex}
        activePageIndex={activePageIndex}
        control={control}
        functions={componentsFieldArray}
      />

      <Button
        variant="light"
        fullWidth
        mt="md"
        leftSection={<IconPlus size={16} />}
        onClick={onAddClick}
        color="blue"
        radius="md"
      >
        Bölüm Ekle
      </Button>
    </Stack>
  );
};

export default SectionList;
