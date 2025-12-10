"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { useQuery } from "@repo/shared";
import { MainDiscount } from "@repo/types";
import { useParams } from "next/navigation";
import DiscountForm from "../components/DiscountForm";

const DiscountFormPage = () => {
  const params = useParams();
  const { slug } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["get-admin-discount", slug],
    queryFn: async () => {
      if (!slug || slug === "new") {
        return null;
      }
      const res = await fetchWrapper.get<MainDiscount>(
        "/admin/discounts/" + slug
      );
      if (!res.success) {
        return null;
      }
      return res.data;
    },
  });

  if (slug === "new") {
    return <DiscountForm />;
  }
  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }
  if (!data) {
    return <div>İndirim Bulunamadı.</div>;
  }
  return <DiscountForm defaultValues={data} />;
};

export default DiscountFormPage;
