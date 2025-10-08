"use client";
import { getOrderStatusFromInt, getPaymentStatusFromInt } from "@repo/shared";
import { useSearchParams } from "next/navigation";

const AdminOrdersPage = () => {
  const params = useSearchParams();
  const page = parseInt(params.get("page") || "1", 10) || 1;

  const osParam = params.get("os") as string;
  const orderStatus = osParam
    ? getOrderStatusFromInt(parseInt(osParam, 10))
    : null;

  const psParam = params.get("ps") as string;
  const paymentStatus = psParam
    ? getPaymentStatusFromInt(parseInt(psParam, 10))
    : null;

  const search = (params.get("search") as string) || null;
  //   const { data, isLoading, isFetching, isPending } = useQuery({
  //     queryKey: ["admin-orders-page"],
  //   });

  return <div>AdminOrdersPage</div>;
};

export default AdminOrdersPage;
