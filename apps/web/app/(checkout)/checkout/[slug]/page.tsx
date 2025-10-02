import { getSession } from "@lib/auth";
import { Params, SearchParams } from "types/GlobalTypes";
import NonAuthUserCheckoutPage from "./components/Non_Auth_User/NonAuthUserCheckoutPage";
import { Group, Text } from "@mantine/core";
import Link from "next/link";
import logo from "../../../../public/logo.svg";
import Image from "next/image";
import AuthUserCheckoutPage from "./components/Auth_User/AuthUserCheckoutPage";

export type CheckoutStep = "info" | "shipping" | "payment";

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

const CheckoutPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { slug } = await params;
  const session = await getSession();
  const pageSearchParams = await searchParams;
  const step: CheckoutStep = (pageSearchParams.step as CheckoutStep) || "info";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 w-full max-w-[1250px] lg:mx-auto px-4 mb-5">
        <CheckoutMobileDrawer />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1 lg:py-8 lg:px-3 lg:space-y-5">
            <CheckoutDesktopHeader />
            {session ? (
              <AuthUserCheckoutPage
                userInfo={session}
                cartId={slug}
                step={step}
              />
            ) : (
              <NonAuthUserCheckoutPage cartId={slug} step={step} />
            )}
          </div>
          <div className="order-1 lg:order-2 lg:py-8 lg:px-3">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                sepet özeti gelecek
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-12 w-full flex flex-row bg-blue-400"></div>
    </div>
  );
};

export default CheckoutPage;
