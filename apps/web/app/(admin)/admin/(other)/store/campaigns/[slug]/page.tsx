"use client";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper, { ApiError } from "@lib/fetchWrapper";
import { useQuery } from "@repo/shared";
import { CampaignZodType } from "@repo/types";
import { useParams } from "next/navigation";
import CampaignForm from "../components/CampaignForm";

const AdminCampaignFormPage = () => {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-campaign-form", slug],
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        success: boolean;
        data?: CampaignZodType;
        message?: string;
      }>(`/admin/campaigns/get-campaign/${slug}`);

      if (!res.success) {
        const errorResponse = res as ApiError;
        throw new Error(errorResponse.error || "Failed to fetch campaign");
      }

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch campaign");
      }

      return res.data.data!;
    },
    enabled: slug !== "new",
  });

  if (slug === "new") {
    return <CampaignForm />;
  }

  if (isLoading) {
    return <GlobalLoadingOverlay />;
  }

  if (!data) {
    return <div>Kampanya bulunamadı</div>;
  }

  return <CampaignForm defaultValues={data} />;
};

export default AdminCampaignFormPage;
