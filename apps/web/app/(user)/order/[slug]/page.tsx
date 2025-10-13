import { Params } from "types/GlobalTypes";
import OrderClientPage from "../components/OrderClientPage";
import { getSession } from "@lib/auth";

const OrderUserPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  const session = await getSession();
  return (
    <div className="flex-1 flex flex-col max-w-[1500px] w-full lg:mx-auto px-4">
      <OrderClientPage slug={slug} session={session} />
    </div>
  );
};

export default OrderUserPage;
