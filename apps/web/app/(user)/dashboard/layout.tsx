"use client";
import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import { Accordion, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const links: Array<{ url: string; label: string }> = [
    { label: "Profilim", url: "/dashboard" },
    { label: "Siparişlerim", url: "/dashboard/orders" },
    { label: "Adreslerim", url: "/dashboard/addresses" },
    { label: "Beğendiğim Ürünler", url: "/dashboard/wishlist" },
  ];
  const pathname = usePathname();
  const { media } = useTheme();
  const { push } = useRouter();
  return (
    <Stack gap={"xl"} className="flex-1 w-full lg:mx-auto max-w-[1500px]  px-4">
      {media === "desktop" ? (
        <Group
          pt={"xl"}
          gap={"xl"}
          justify="center"
          className="border-b border-gray-300 pb-4"
        >
          {links.map((link, idx) => (
            <UnstyledButton
              key={idx}
              onClick={() => {
                push(link.url);
              }}
            >
              <Text
                tt={"capitalize"}
                fw={pathname === link.url ? 700 : 400}
                fz={"lg"}
              >
                {link.label}
              </Text>
            </UnstyledButton>
          ))}
        </Group>
      ) : (
        <Accordion
          pt={"xl"}
          chevronIconSize={24}
          classNames={{
            control: "bg-transparent",
          }}
        >
          <Accordion.Item value="main">
            <Accordion.Control px={0}>
              <Text tt={"capitalize"} fw={500} fz={"lg"}>
                Hesabım
              </Text>
            </Accordion.Control>
            <Accordion.Panel px={0}>
              <Stack gap={"xs"} px={0} py={"md"}>
                {links.map((link, idx) => (
                  <UnstyledButton
                    key={idx}
                    onClick={() => {
                      push(link.url);
                    }}
                  >
                    <Text
                      tt={"capitalize"}
                      fw={pathname === link.url ? 700 : 400}
                      fz={"lg"}
                    >
                      {link.label}
                    </Text>
                  </UnstyledButton>
                ))}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      {children}
    </Stack>
  );
};

export default DashboardLayout;
