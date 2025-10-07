"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/fetchWrapper";
import { Group, Text } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { GetCartClientCheckoutReturnType, TokenPayload } from "@repo/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import logo from "../../../../../public/logo.svg";
import { CheckoutStep } from "../page";
import CheckoutPageRightSection from "./CheckoutPageRightSection";

const AuthUserCheckoutPage = dynamic(
  () => import("./Auth_User/AuthUserCheckoutPage"),
  {
    ssr: false,
    loading: () => <GlobalLoadingOverlay />,
  }
);

const NonAuthUserCheckoutPage = dynamic(
  () => import("./Non_Auth_User/NonAuthUserCheckoutPage"),
  {
    ssr: false,
    loading: () => <GlobalLoadingOverlay />,
  }
);

const CheckoutDesktopHeader = () => {
  return (
    <Group
      visibleFrom="sm"
      className="h-20"
      justify="space-between"
      align="center"
    >
      <Link href={"/"} className="min-h-full aspect-[2/1] relative">
        <Image src={logo} fill alt="HEADER LOGO" sizes="100vw" />
      </Link>
      <Text>Giriş Yap</Text>
    </Group>
  );
};

const CheckoutMobileDrawer = () => {
  return (
    <Group
      hiddenFrom="sm"
      className="h-20"
      justify="space-between"
      align="center"
    >
      <Link href={"/"} className="min-h-full aspect-[2/1] relative">
        <Image src={logo} fill alt="HEADER LOGO" sizes="100vw" />
      </Link>
      <Text>Giriş Yap</Text>
    </Group>
  );
};

interface ClientCheckoutPageProps {
  session: TokenPayload | null;
  slug: string;
  step: CheckoutStep;
}
const ClientCheckoutPage = ({
  session,
  slug,
  step,
}: ClientCheckoutPageProps) => {
  const { data, isLoading, isPending, isFetching } = useQuery({
    queryKey: ["non-auth-user-cart", slug, step],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetCartClientCheckoutReturnType>(
        `/cart-v3/get-user-cart-info-for-checkout/${slug}`,
        {
          credentials: "include",
        }
      );
      if (res.success) {
        return res.data.cart;
      }
      throw new Error("Failed to fetch cart info");
    },
  });

  if (isLoading || isPending || isFetching) {
    return <GlobalLoadingOverlay />;
  }
  if (!data) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-[1250px] lg:mx-auto px-4 ">
        <CheckoutMobileDrawer />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1 lg:py-8 lg:px-3 lg:space-y-5">
            <CheckoutDesktopHeader />
            {session ? (
              <AuthUserCheckoutPage
                userInfo={session}
                cartId={slug}
                data={data}
                step={step}
              />
            ) : (
              <NonAuthUserCheckoutPage data={data} cartId={slug} step={step} />
            )}
          </div>
          <div className="order-1 lg:order-2 lg:py-8 lg:px-3">
            <div className="sticky top-4 space-y-4">
              <CheckoutPageRightSection
                cargoRule={data.cargoRule}
                cartItems={data.items}
                step={step}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <div className="h-12 w-full flex flex-row bg-blue-400"></div> */}
    </div>
  );
};

export default ClientCheckoutPage;
