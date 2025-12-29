import { Button, Group, Title } from "@mantine/core";

const AdminInventoryPage = () => {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Group
        justify="space-between"
        align="center"
        className="pb-4 border-b border-gray-300"
      >
        <Title order={4}>Stok Lokasyonları</Title>
        <Group>
          <Button>Stok Lokasyonu Ekle</Button>
        </Group>
      </Group>
    </div>
  );
};

export default AdminInventoryPage;
