import { Button, Group, Stack, Text } from "@mantine/core";
import { IconChevronRight, IconGitBranch } from "@tabler/icons-react";
interface FlowDrawerButtonProps {
  openFlow: () => void;
  isEdit?: boolean;
}

const FlowDrawerButton = ({ openFlow, isEdit }: FlowDrawerButtonProps) => {
  return (
    <Button
      onClick={openFlow}
      variant="light"
      size="lg"
      fullWidth
      styles={{
        root: {
          height: "auto",
          padding: "var(--mantine-spacing-md)",
        },
        inner: {
          justifyContent: "flex-start",
        },
        label: {
          width: "100%",
        },
      }}
    >
      <Group wrap="nowrap" gap="md" w="100%">
        <IconGitBranch size={32} stroke={1.5} />
        <Stack gap={4} style={{ flex: 1, textAlign: "left" }}>
          <Text fw={500} size="sm">
            {isEdit ? "Karar Ağacını Düzenle" : "Karar Ağacı Oluştur"}
          </Text>
          <Text size="xs" c="dimmed" fw={400}>
            Müşteri davranışlarına göre dinamik segment koşulları belirleyin
          </Text>
        </Stack>
        <IconChevronRight size={20} />
      </Group>
    </Button>
  );
};

export default FlowDrawerButton;
