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
  disabled?: boolean;
}

const SectionList = ({
  onAddClick,
  control,
  activePageIndex,
  disabled = false,
}: SectionListProps) => {
  const componentsFieldArray = useFieldArray({
    control: control,
    name: `pages.${activePageIndex}.components`,
    keyName: "rhf_id",
  });

  return (
    <Stack gap={"xs"} px="sm">
      <Text size="xs" fw={700} c="dimmed">
        BÖLÜMLER ({componentsFieldArray.fields?.length})
      </Text>

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
        disabled={disabled}
      >
        Bölüm Ekle
      </Button>
    </Stack>
  );
};

export default SectionList;
