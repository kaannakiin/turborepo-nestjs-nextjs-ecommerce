import ActionPopover from "@/(admin)/components/ActionPopoverr";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import { getCartStatusColor, getCartStatusLabel } from "@lib/helpers";
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Group,
  Menu,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { DateFormatter } from "@repo/shared";
import { $Enums, AdminCartTableData } from "@repo/types";
import { IconMenu, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CartsTable = ({
  data,
  activeFilters,
}: {
  data: AdminCartTableData[];
  activeFilters: boolean;
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]); // null yerine []
  const { push } = useRouter();

  const allCartSelected =
    data &&
    data.length > 0 &&
    selectedCards.length > 0 &&
    data.every((cart) => selectedCards.includes(cart.cartId));

  const nothingSelected = selectedCards.length === 0;

  const handleSelectAll = () => {
    if (allCartSelected) {
      setSelectedCards([]);
    } else {
      setSelectedCards(data.map((cart) => cart.cartId));
    }
  };

  const handleSelectCart = (cartId: string) => {
    if (selectedCards.includes(cartId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cartId));
    } else {
      setSelectedCards([...selectedCards, cartId]);
    }
  };

  return (
    <Stack gap={"xs"}>
      <Group justify="flex-end">
        {allCartSelected && (
          <ActionPopover
            targetIcon={<IconTrash color="red" />}
            text="Tüm sepetleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
            size="lg"
          />
        )}
      </Group>
      <Table.ScrollContainer minWidth={800}>
        <Table
          verticalSpacing={"sm"}
          highlightOnHover
          highlightOnHoverColor="admin.0"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={24}>
                <Checkbox
                  indeterminate={!nothingSelected && !allCartSelected}
                  checked={allCartSelected}
                  onChange={handleSelectAll}
                />
              </Table.Th>
              <Table.Th>Kullanıcı</Table.Th>
              <Table.Th>Ürün Sayısı </Table.Th>
              <Table.Th>Toplam Fiyat</Table.Th>
              <Table.Th>Toplam İndirimli Fiyat</Table.Th>
              <Table.Th>Durum</Table.Th>
              <Table.Th>Oluşturulma Tarihi</Table.Th>
              <Table.Th>Güncellenme Tarihi</Table.Th>
              <Table.Th w={24} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data && data.length > 0 ? (
              data.map((cart) => {
                return (
                  <Table.Tr key={cart.cartId}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedCards.includes(cart.cartId)}
                        onChange={() => handleSelectCart(cart.cartId)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={"xs"}>
                        <Text tt="capitalize" fz={"sm"} fw={700}>
                          {cart.user
                            ? `${cart.user.name} ${cart.user.surname}`
                            : "Misafir"}
                        </Text>
                        <Text fz={"xs"} fw={500}>
                          {cart.user ? `${cart.user.email}` : ""}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>{cart.totalItems}</Table.Td>
                    <Table.Td>
                      <ProductPriceFormatter
                        price={cart.totalPrice}
                        currency={cart.currency}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={"xs"}>
                        {cart.totalDiscount &&
                        cart.totalPrice - cart.totalDiscount !== 0 ? (
                          <ProductPriceFormatter
                            price={cart.totalPrice - cart.totalDiscount}
                            currency={cart.currency}
                          />
                        ) : (
                          <Text>İndirim Uygulanmamış</Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        radius={"0"}
                        color={getCartStatusColor(cart.status)}
                      >
                        {getCartStatusLabel(cart.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {DateFormatter.withTime(cart.createdAt)}
                    </Table.Td>
                    <Table.Td>
                      {DateFormatter.withTime(cart.updatedAt)}
                    </Table.Td>
                    <Table.Td align="center">
                      {!allCartSelected &&
                        selectedCards.includes(cart.cartId) && (
                          <ActionPopover
                            targetIcon={<IconTrash color="red" />}
                            size="sm"
                            text="Seçili sepeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                            onConfirm={() => {}}
                          />
                        )}
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center min-w-full min-h-20">
                <Stack>
                  {activeFilters && (
                    <Button
                      color="red"
                      variant="outline"
                      onClick={() => {
                        push("/admin/carts", { scroll: false });
                      }}
                    >
                      Filtreleri Temizle
                    </Button>
                  )}
                </Stack>
              </div>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
};

export default CartsTable;
