import { getSession } from "@lib/auth";
import { Params, SearchParams } from "types/GlobalTypes";
import NonAuthUserCheckoutPage from "./components/Non_Auth_User/NonAuthUserCheckoutPage";

export type CheckoutStep = "info" | "shipping" | "payment";

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
    <div className="w-full h-20 max-w-[1250px] lg:mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="order-2 lg:order-1">
          {session ? null : (
            <NonAuthUserCheckoutPage cartId={slug} step={step} />
          )}
        </div>
        <div className="order-1 lg:order-2">sepet özeti gelecek</div>
      </div>
    </div>
  );
};

export default CheckoutPage;
