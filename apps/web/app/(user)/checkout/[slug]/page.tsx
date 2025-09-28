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
    <div className="w-full min-h-screen max-w-[1250px] lg:mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol taraf - uzun içerik */}
        <div className="order-2 lg:order-1 lg:py-8 lg:px-3">
          {session ? null : (
            <NonAuthUserCheckoutPage cartId={slug} step={step} />
          )}
        </div>

        {/* Sağ taraf - sticky */}
        <div className="order-1 lg:order-2 lg:py-8 lg:px-3">
          <div className="sticky top-4 space-y-4">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              sepet özeti gelecek
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
