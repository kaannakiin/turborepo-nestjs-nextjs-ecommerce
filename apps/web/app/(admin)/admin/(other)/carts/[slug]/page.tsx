"use client";

import fetchWrapper from "@lib/fetchWrapper";
import { useQuery } from "@repo/shared";
import { useParams } from "next/navigation";

const CartViewPage = () => {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-cart", { slug }],
    queryFn: async () => {
      const response = await fetchWrapper.get(`/admin/carts/${slug}`);
    },
    gcTime: 0,
    staleTime: 0,
  });

  return <div>CartViewPage</div>;
};

export default CartViewPage;
