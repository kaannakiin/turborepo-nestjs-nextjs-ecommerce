"use client";
import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { GetUserCartInfoForCheckoutReturn } from "@repo/types";
import { useState } from "react";
import { CheckoutStep } from "../page";
import { IconInfoCircleFilled } from "@tabler/icons-react";

interface CheckoutPageRightSectionProps {
  step: CheckoutStep;
  cartItems: GetUserCartInfoForCheckoutReturn["items"];
}

const CheckoutPageRightSection = ({
  step,
  cartItems,
}: CheckoutPageRightSectionProps) => {
  const [openNote, setOpenNote] = useState<boolean>(false);
  const [openDiscount, setOpenDiscount] = useState<boolean>(false);
  const { media } = useTheme();

  return (
    <Stack gap="lg">
      <ScrollArea.Autosize
        mah={"40vh"}
        scrollbarSize={4}
        type="scroll"
        classNames={{
          scrollbar: "!bg-gray-200 ",
        }}
      >
        <Stack gap={"xl"} p={"md"}>
          {cartItems &&
            cartItems.length > 0 &&
            cartItems.map((item) => (
              <div key={item.itemId} className="flex gap-3 w-full">
                <div className="relative flex-shrink-0">
                  <Avatar
                    size={"xl"}
                    radius={"xs"}
                    src={item.productAsset.url}
                  />
                  <Badge
                    size="md"
                    variant="filled"
                    color={"black"}
                    circle
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      padding: 0,
                      minWidth: 24,
                      height: 24,
                    }}
                  >
                    {item.quantity}
                  </Badge>
                </div>

                {/* Orta ve sağ taraf - Ürün bilgileri ve fiyat */}
                <div className="flex-1 flex justify-between gap-3 min-w-0">
                  {/* Ürün adı ve varyantlar */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <Text
                      tt={"capitalize"}
                      fz={"sm"}
                      fw={500}
                      className="line-clamp-2"
                    >
                      {item.productName}
                    </Text>

                    {item.variantId &&
                      item.variantOptions &&
                      item.variantOptions.length > 0 && (
                        <div className="flex flex-col gap-0.5">
                          {item.variantOptions.map((option) => (
                            <Text
                              tt={"capitalize"}
                              key={
                                option.variantGroupSlug +
                                option.variantOptionSlug
                              }
                              fz={"xs"}
                              c="dimmed"
                              className="line-clamp-1"
                            >
                              {option.variantOptionName}
                            </Text>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Fiyat bilgileri */}
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    {item.discountedPrice ? (
                      <>
                        <ProductPriceFormatter
                          fz={"sm"}
                          fw={700}
                          price={item.discountedPrice}
                        />
                        <ProductPriceFormatter
                          fz={"xs"}
                          className="line-through text-gray-500"
                          price={item.price}
                        />
                      </>
                    ) : (
                      <ProductPriceFormatter
                        fz={"sm"}
                        fw={700}
                        price={item.price}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
        </Stack>
      </ScrollArea.Autosize>
      <Divider size={"md"} />
      <Group justify="space-between">
        <Group gap={"xs"} align="center">
          <Text c={"dimmed"}>Ara Toplam</Text>
          <Tooltip label="Ara toplam, ürünlerin fiyatlarının toplamıdır. Kargo ve vergiler dahil değildir.">
            <ThemeIcon size={"sm"} variant="transparent" c="dimmed">
              <IconInfoCircleFilled />
            </ThemeIcon>
          </Tooltip>
        </Group>
        <ProductPriceFormatter
          c={"dimmed"}
          price={cartItems.reduce(
            (sum, i) => sum + (i.discountedPrice || i.price) * i.quantity,
            0
          )}
        />
      </Group>
      <Divider size={"md"} />
      <Stack gap={"md"}>
        {openDiscount ? (
          <TextInput
            size="md"
            variant="filled"
            classNames={{
              label: "!w-full mb-1",
              input: "!pr-0 !outline-none focus:!ring-0 focus:!ring-offset-0",
              root: "!my-0 !py-0",
            }}
            styles={{
              input: {
                paddingRight: 0,
              },
            }}
            rightSectionWidth={"20%"}
            rightSection={
              <Button fullWidth radius={"md"} h="100%" color="black">
                Uygula
              </Button>
            }
            label={
              <Group justify="space-between" pr={"xs"}>
                <Text>İndirim Kodu</Text>
                <UnstyledButton
                  onClick={() => setOpenDiscount(false)}
                  className="hover:underline hover:underline-offset-2"
                >
                  Kapat
                </UnstyledButton>
              </Group>
            }
          />
        ) : (
          <UnstyledButton
            onClick={() => {
              setOpenDiscount(!openDiscount);
            }}
          >
            İndirim Kodu Ekle
          </UnstyledButton>
        )}
        {!openNote ? (
          <UnstyledButton
            onClick={() => {
              setOpenNote(!openNote);
            }}
          >
            Sipariş Notu Ekle
          </UnstyledButton>
        ) : (
          <>
            <Textarea
              size="lg"
              variant="filled"
              classNames={{
                label: "!w-full mb-1",
              }}
              label={
                <Group justify="space-between" pr={"xs"}>
                  <Text>Sipariş Notu</Text>
                  <UnstyledButton
                    onClick={() => setOpenNote(false)}
                    className="hover:underline hover:underline-offset-2"
                  >
                    Kapat
                  </UnstyledButton>
                </Group>
              }
            />
            <Group justify="end">
              <Button size="sm" color="black" radius={"md"}>
                Notu Kaydet
              </Button>
            </Group>
          </>
        )}
      </Stack>
      <Divider size={"md"} />
      <Group justify="space-between">
        <Text c={"black"} fz={"lg"} fw={700}>
          Toplam
        </Text>
        <ProductPriceFormatter
          c={"black"}
          fz={"lg"}
          fw={700}
          price={cartItems.reduce(
            (sum, i) => sum + (i.discountedPrice || i.price) * i.quantity,
            0
          )}
        />
      </Group>
    </Stack>
  );
};

export default CheckoutPageRightSection;
