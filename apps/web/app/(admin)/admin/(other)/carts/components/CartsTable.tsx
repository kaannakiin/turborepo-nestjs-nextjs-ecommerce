import ActionPopover from "@/(admin)/components/ActionPopoverr";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import { getCartStatusColor, getCartStatusLabel } from "@lib/helpers";
import {
  AspectRatio,
  Badge,
  Button,
  Checkbox,
  Group,
  HoverCard,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Box,
  Divider,
  Center,
} from "@mantine/core";
import { DateFormatter } from "@repo/shared";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CartsTable = ({
  data,
  activeFilters,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  activeFilters: boolean;
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
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
                    <Table.Td>
                      <HoverCard width={400} shadow="md" position="bottom">
                        <HoverCard.Target>
                          <ThemeIcon
                            radius={"xl"}
                            variant="outline"
                            style={{ cursor: "pointer" }}
                          >
                            <Text>{cart.items.length}</Text>
                          </ThemeIcon>
                        </HoverCard.Target>
                        <HoverCard.Dropdown p="md">
                          <ScrollArea h={500}>
                            <Stack gap={"md"}>
                              <Text fw={600} size="sm">
                                Sepetteki Ürünler
                              </Text>
                              {cart.items.map((item, index) => {
                                const imageUrl =
                                  item.variantAsset?.type === "IMAGE"
                                    ? item.variantAsset.url
                                    : item.productAsset?.type === "IMAGE"
                                      ? item.productAsset.url
                                      : null;

                                return (
                                  <Box key={item.itemId}>
                                    <Group
                                      gap="md"
                                      align="flex-start"
                                      wrap="nowrap"
                                    >
                                      {imageUrl && (
                                        <Box
                                          w={80}
                                          h={80}
                                          style={{ flexShrink: 0 }}
                                        >
                                          <AspectRatio ratio={1} pos="relative">
                                            <CustomImage src={imageUrl} />
                                          </AspectRatio>
                                        </Box>
                                      )}
                                      <Stack gap="xs" style={{ flex: 1 }}>
                                        <Text fw={600} size="sm" lineClamp={2}>
                                          {item.productName}
                                        </Text>

                                        {item.variantOptions &&
                                          item.variantOptions.length > 0 && (
                                            <Group gap="xs">
                                              {item.variantOptions.map(
                                                (option, idx) => (
                                                  <Badge
                                                    key={idx}
                                                    size="xs"
                                                    variant="light"
                                                    color="gray"
                                                  >
                                                    {option.variantOptionName}
                                                  </Badge>
                                                )
                                              )}
                                            </Group>
                                          )}

                                        <Group gap="xs">
                                          <Text size="xs" c="dimmed">
                                            Adet: {item.quantity}
                                          </Text>
                                          <Text size="xs" c="dimmed">
                                            •
                                          </Text>
                                          <ProductPriceFormatter
                                            price={
                                              item.discountedPrice || item.price
                                            }
                                            currency={cart.currency}
                                          />
                                        </Group>

                                        {item.discountedPrice &&
                                          item.discountedPrice < item.price && (
                                            <ProductPriceFormatter
                                              price={item.price}
                                              currency={cart.currency}
                                              size="xs"
                                              c="dimmed"
                                              td="line-through"
                                            />
                                          )}

                                        {item.isDeleted && (
                                          <Badge
                                            size="xs"
                                            color="red"
                                            variant="light"
                                          >
                                            Silinmiş Ürün
                                          </Badge>
                                        )}
                                      </Stack>
                                    </Group>
                                    {index < cart.items.length - 1 && (
                                      <Divider my="xs" />
                                    )}
                                  </Box>
                                );
                              })}
                            </Stack>
                          </ScrollArea>
                        </HoverCard.Dropdown>
                      </HoverCard>
                    </Table.Td>
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
              <Table.Tr>
                <Table.Td colSpan={9}>
                  <Center py={60}>
                    <Stack align="center" gap="md">
                      <Text size="lg" fw={500} c="dimmed">
                        {activeFilters
                          ? "Filtrelere uygun sepet bulunamadı"
                          : "Henüz sepet bulunmamaktadır"}
                      </Text>
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
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
};

export default CartsTable;
