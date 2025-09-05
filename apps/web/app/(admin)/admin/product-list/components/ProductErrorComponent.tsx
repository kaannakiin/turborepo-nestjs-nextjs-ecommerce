import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

const ProductErrorComponent = ({ message }: { message: string }) => (
  <Center style={{ minHeight: "60vh" }}>
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Stack align="center" gap="md">
        <IconAlertCircle size={48} color="var(--mantine-color-orange-6)" />
        <Title order={2} ta="center" c="dimmed">
          Bir Hata Oluştu
        </Title>
        <Text ta="center" c="dimmed" size="lg">
          {message}
        </Text>
        <Button
          component={Link}
          href="/admin/product-list"
          leftSection={<IconArrowLeft size={16} />}
          variant="light"
          size="md"
        >
          Ürünler Listesine Dön
        </Button>
      </Stack>
    </Paper>
  </Center>
);
export default ProductErrorComponent;
