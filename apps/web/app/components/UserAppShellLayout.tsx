"use client";
import FooterComponent from "@/(admin)/admin/(theme)/components/FooterComponent";
import { CartProviderV2 } from "@/context/cart-context/CartContextV2";
import { ActionIcon, AppShell, Drawer, Group, Stack } from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import { useQuery } from "@repo/shared";
import {
  $Enums,
  CategoryHeaderData,
  MainPageComponentsType,
  TokenPayload,
} from "@repo/types";
import { IconMenu2, IconUserCircle } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "../../public/logo.svg";
import DesktopCategoryDrawer from "./DesktopCategoryDrawer";
import GlobalLoadingOverlay from "./GlobalLoadingOverlay";
import ShoppingBagDrawer from "./ShoppingBagDrawer";
import fetchWrapper from "@lib/fetchWrapper";

const UserAppShellLayout = ({
  children,
  headerCategoryData,
  session,
}: {
  children: React.ReactNode;
  headerCategoryData: CategoryHeaderData[] | null;
  session: TokenPayload | null;
}) => {
  const pinned = useHeadroom({ fixedAt: 160 });
  const [opened, { open, close }] = useDisclosure();
  const locale: $Enums.Locale = "TR";
  const { push } = useRouter();
  const { data, isLoading, isFetching, isPending } = useQuery({
    queryKey: ["footer-data"],
    queryFn: async (): Promise<{
      footer: MainPageComponentsType["footer"] | null;
    }> => {
      const footerReq = await fetchWrapper.get(`/admin/theme/get-footer`, {
        method: "GET",
        credentials: "include",
      });

      if (!footerReq.success) {
        return { footer: null };
      }

      const footerData = footerReq.data as {
        footer: MainPageComponentsType["footer"] | null;
      };

      return footerData;
    },
  });
  if (isFetching || isPending || isLoading) {
    return <GlobalLoadingOverlay />;
  }
  return (
    <CartProviderV2>
      <AppShell header={{ height: 80, collapsed: !pinned }} zIndex={100000}>
        <AppShell.Header className="h-20 border-none!">
          <Group
            className="w-full h-20 max-w-[1500px] lg:mx-auto px-4"
            justify="space-between"
            align="center"
          >
            <Group align="center" h={"100%"} gap={"xl"} py={0}>
              <Link href={"/"} className="min-h-full  aspect-[2/1] relative">
                <Image src={logo} fill alt="HEADER LOGO" sizes="100vw" />
              </Link>
              <Group
                align="center"
                visibleFrom="sm"
                h={"100%"}
                px={"xl"}
                gap={"xl"}
              >
                {headerCategoryData &&
                  headerCategoryData.length > 0 &&
                  headerCategoryData.map((category) => (
                    <DesktopCategoryDrawer
                      key={category.id}
                      category={category}
                      locale={locale}
                    />
                  ))}
              </Group>
            </Group>

            <Group align="center" gap={"0"}>
              <ShoppingBagDrawer />
              <ActionIcon
                variant="transparent"
                size={"xl"}
                visibleFrom="sm"
                onClick={() => {
                  if (session) {
                    push("/dashboard");
                  } else {
                    push("/auth");
                  }
                }}
              >
                <IconUserCircle size={28} />
              </ActionIcon>
              <ActionIcon
                variant="transparent"
                onClick={open}
                size={"xl"}
                hiddenFrom="sm"
              >
                <IconMenu2 size={28} stroke={2} />
              </ActionIcon>
            </Group>
          </Group>
        </AppShell.Header>

        <Drawer.Root
          opened={opened}
          onClose={close}
          position="right"
          size={"xs"}
        >
          <Drawer.Overlay backgroundOpacity={0.5} blur={4} />
          <Drawer.Content>
            <Drawer.Header py={"0"}>
              <Drawer.Title h={"100%"}>
                <div className="min-h-full h-12 aspect-[2/1] relative">
                  <Image src={logo} fill alt="HEADER LOGO" sizes="100vw" />
                </div>
              </Drawer.Title>
              <Drawer.CloseButton size={"lg"} fw={700} />
            </Drawer.Header>
            <Drawer.Body className="space-y-2 overflow-y-auto max-h-full"></Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>

        <AppShell.Main px={0} pb={0} pt="80px">
          <Stack gap={"xl"} p="0" m="0">
            {children}
            {data && data.footer && (
              <FooterComponent footerData={data.footer} />
            )}
          </Stack>
        </AppShell.Main>
      </AppShell>
    </CartProviderV2>
  );
};

export default UserAppShellLayout;
