"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import {
  Accordion,
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
import { CartV3, CheckoutCargoRule } from "@repo/types";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { useState } from "react";
import { CheckoutStep } from "../page";

interface CheckoutPageRightSectionProps {
  step: CheckoutStep;
  cartItems: CartV3["items"];
  cargoRule: CheckoutCargoRule | null;
}

// Cart Item Component
const CartItem = ({ item }: { item: CartV3["items"][0] }) => (
  <div className="flex gap-3 w-full">
    <div className="relative flex-shrink-0">
      <Avatar size="xl" radius="xs" src={item.productAsset.url} />
      <Badge
        size="md"
        variant="filled"
        color="black"
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

    <div className="flex-1 flex justify-between gap-3 min-w-0">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <Text tt="capitalize" fz="sm" fw={500} className="line-clamp-2">
          {item.productName}
        </Text>
        {item.variantId &&
          item.variantOptions &&
          item.variantOptions.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {item.variantOptions.map((option) => (
                <Text
                  tt="capitalize"
                  key={option.variantGroupSlug + option.variantOptionSlug}
                  fz="xs"
                  c="dimmed"
                  className="line-clamp-1"
                >
                  {option.variantOptionName}
                </Text>
              ))}
            </div>
          )}
      </div>

      <div className="flex flex-col gap-1 items-end flex-shrink-0">
        {item.discountedPrice ? (
          <>
            <ProductPriceFormatter
              fz="sm"
              fw={700}
              price={item.discountedPrice}
            />
            <ProductPriceFormatter
              fz="xs"
              className="line-through text-gray-500"
              price={item.price}
            />
          </>
        ) : (
          <ProductPriceFormatter fz="sm" fw={700} price={item.price} />
        )}
      </div>
    </div>
  </div>
);

// Discount Code Component
const DiscountCodeSection = ({
  openDiscount,
  setOpenDiscount,
}: {
  openDiscount: boolean;
  setOpenDiscount: (value: boolean) => void;
}) => (
  <>
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
        rightSectionWidth="20%"
        rightSection={
          <Button fullWidth radius="md" h="100%" color="black">
            Uygula
          </Button>
        }
        label={
          <Group justify="space-between" pr="xs">
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
      <UnstyledButton onClick={() => setOpenDiscount(true)}>
        İndirim Kodu Ekle
      </UnstyledButton>
    )}
  </>
);

// Order Note Component
const OrderNoteSection = ({
  openNote,
  setOpenNote,
}: {
  openNote: boolean;
  setOpenNote: (value: boolean) => void;
}) => (
  <>
    {!openNote ? (
      <UnstyledButton onClick={() => setOpenNote(true)}>
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
            <Group justify="space-between" pr="xs">
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
          <Button size="sm" color="black" radius="md">
            Notu Kaydet
          </Button>
        </Group>
      </>
    )}
  </>
);

const CartSummary = ({
  cartItems,
  openDiscount,
  setOpenDiscount,
  openNote,
  setOpenNote,
  step,
  cargoRule,
}: {
  cartItems: CartV3["items"];
  openDiscount: boolean;
  setOpenDiscount: (value: boolean) => void;
  openNote: boolean;
  setOpenNote: (value: boolean) => void;
  step: CheckoutStep;
  cargoRule: CheckoutCargoRule | null;
}) => {
  const calculateTotal = () =>
    cartItems?.reduce(
      (sum, i) => sum + (i.discountedPrice || i.price) * i.quantity,
      0
    );

  return (
    <Stack gap="lg">
      <ScrollArea.Autosize
        mah="40vh"
        scrollbarSize={4}
        type="scroll"
        classNames={{
          scrollbar: "!bg-gray-200",
        }}
      >
        <Stack gap="xl" p="md">
          {cartItems?.map((item) => (
            <CartItem
              key={`$${item.productId}-${item.variantId || "default"}`}
              item={item}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>

      <Divider size="md" />

      <Group justify="space-between">
        <Group gap="xs" align="center">
          <Text c="dimmed">Ara Toplam</Text>
          <Tooltip
            w={300}
            label="Ara toplam, ürünlerin fiyatlarının toplamıdır. Kargo ve vergiler dahil değildir. Kargo ücreti kargo adımında hesaplanacaktır."
            multiline
          >
            <ThemeIcon size="sm" variant="transparent" c="dimmed">
              <IconInfoCircleFilled />
            </ThemeIcon>
          </Tooltip>
        </Group>
        <ProductPriceFormatter c="dimmed" price={calculateTotal()} />
      </Group>

      {step === "info" || step === "shipping" ? null : cargoRule &&
        cargoRule.price &&
        cargoRule.price > 0 ? (
        <Group justify="space-between">
          <Text c="dimmed">Kargo Ücreti</Text>
          <ProductPriceFormatter c="dimmed" price={cargoRule.price} />
        </Group>
      ) : (
        <Text c={"dimmed"}>Ücretsiz Kargo</Text>
      )}
      <Divider size="md" />

      <Stack gap="md">
        <DiscountCodeSection
          openDiscount={openDiscount}
          setOpenDiscount={setOpenDiscount}
        />
        <OrderNoteSection openNote={openNote} setOpenNote={setOpenNote} />
      </Stack>

      <Divider size="md" />

      <Group justify="space-between">
        <Text c="black" fz="lg" fw={700}>
          Toplam
        </Text>
        <ProductPriceFormatter
          c="black"
          fz="lg"
          fw={700}
          price={calculateTotal() + (cargoRule?.price || 0)}
        />
      </Group>
    </Stack>
  );
};

const CheckoutPageRightSection = ({
  step,
  cartItems,
  cargoRule,
}: CheckoutPageRightSectionProps) => {
  const [openNote, setOpenNote] = useState(false);
  const [openDiscount, setOpenDiscount] = useState(false);
  const { media } = useTheme();

  const summaryProps = {
    cartItems,
    openDiscount,
    setOpenDiscount,
    openNote,
    setOpenNote,
    step,
    cargoRule,
  };
  return (
    <>
      {media === "desktop" ? (
        <CartSummary {...summaryProps} />
      ) : (
        <Accordion>
          <Accordion.Item value="card">
            <Accordion.Control px={0}>
              Sepetim ({cartItems.length})
            </Accordion.Control>
            <Accordion.Panel px={0}>
              <CartSummary {...summaryProps} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
    </>
  );
};

export default CheckoutPageRightSection;
