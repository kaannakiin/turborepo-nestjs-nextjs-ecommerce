import { getSession } from "@lib/auth";
import { Params, SearchParams } from "types/GlobalTypes";
import ClientCheckoutPage from "./components/ClientCheckoutPage";

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
  return <ClientCheckoutPage session={session} slug={slug} step={step} />;
};

export default CheckoutPage;
