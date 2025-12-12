import {
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { ThemeComponents } from "@repo/types";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { CreatebleSelectType } from "../../page";

const ComponentLibrary = ({
  items,
  onSelect,
}: {
  items: CreatebleSelectType[];
  onSelect: (type: ThemeComponents) => void;
}) => {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack px="sm" pb="xl">
      <TextInput
        placeholder="Bölüm ara..."
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="xs"
      />

      {filteredItems.map((comp) => (
        <UnstyledButton
          key={comp.type}
          onClick={() => onSelect(comp.type)}
          className="hover:bg-gray-100 p-3 rounded-md transition-colors border border-transparent hover:border-gray-200"
        >
          <Group wrap="nowrap" align="flex-start">
            <ThemeIcon size="lg" variant="light" radius="md">
              {comp.icon}
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600}>
                {comp.label}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {comp.description}
              </Text>
            </div>
            <ThemeIcon variant="transparent" c="dimmed">
              <IconPlus size={16} />
            </ThemeIcon>
          </Group>
        </UnstyledButton>
      ))}
    </Stack>
  );
};

export default ComponentLibrary;
