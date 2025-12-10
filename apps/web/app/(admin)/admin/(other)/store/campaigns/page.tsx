"use client";
import CustomPagination from "@/components/CustomPagination";
import CustomSearchInput from "@/components/CustomSearchInput";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import {
  getCampaignOfferPageLabel,
  getCampaignStatusLabel,
  getCampaignTypeLabel,
} from "@lib/helpers";
import {
  Badge,
  Button,
  Group,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { $Enums, CampaignStatus } from "@repo/database/client";
import { DateFormatter, useQuery } from "@repo/shared";
import { GetCampaignsReturnType } from "@repo/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const AdminCampaignPage = () => {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const type = (searchParams.get("type") as $Enums.CampaignStatus) || null;
  const { replace, push } = useRouter();

  const hasSearchParams = useMemo(() => {
    return search !== "" || type !== null;
  }, [search, type]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-campaigns", { search, type, page }],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetCampaignsReturnType>(
        `/admin/campaigns/campaigns`,
        {
          params: {
            page,
            ...(search && search !== "" ? { search } : {}),
            ...(type ? { type } : {}),
          },
        }
      );

      if (!res.success) {
        throw new Error("Failed to fetch campaigns");
      }

      if (!res.data.success || !res.data.data || !res.data.pagination) {
        throw new Error(res.data.message);
      }

      return { data: res.data.data, pagination: res.data.pagination };
    },
  });

  const hasData = data && data.data && data.data.length > 0;

  const handleClearFilters = () => {
    replace("?");
  };

  const handleCreateCampaign = () => {
    push("/admin/store/campaigns/new");
  };

  const renderEmptyState = () => {
    if (!hasSearchParams && !hasData) {
      return (
        <Stack gap={"lg"} align="center" justify="center" mih={400}>
          <Title order={3}>Kampanyanız Bulunmuyor</Title>
          <Text c="dimmed" ta="center">
            Henüz hiç kampanya oluşturmadınız. İlk kampanyanızı oluşturmak için
            aşağıdaki butona tıklayın.
          </Text>
          <Button onClick={handleCreateCampaign} size="md">
            İlk Kampanyanızı Ekleyin
          </Button>
        </Stack>
      );
    }

    if (hasSearchParams && !hasData) {
      return (
        <Stack gap={"lg"} align="center" justify="center" mih={300}>
          <Text c="dimmed" ta="center">
            Aradığınız kriterlere uygun kampanya bulunamadı.
          </Text>
          <Button onClick={handleClearFilters} variant="outline">
            Filtreleri Temizle
          </Button>
        </Stack>
      );
    }

    return null;
  };

  return (
    <>
      {isLoading && <GlobalLoadingOverlay />}
      <Stack gap={"lg"}>
        <Group align="center" justify="space-between">
          <Title order={3}>Kampanyalar</Title>
          <Group gap={"md"}>
            <Select
              placeholder="Durum"
              value={searchParams.get("type") || null}
              onChange={(value) => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("page");
                if (value) {
                  params.set("type", value);
                } else {
                  params.delete("type");
                }
                replace(`?${params.toString()}`);
              }}
              data={Object.values(CampaignStatus).map((value) => ({
                label: getCampaignStatusLabel(value),
                value,
              }))}
            />
            <CustomSearchInput />
          </Group>
        </Group>

        {!isLoading && !hasData ? (
          renderEmptyState()
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table
              highlightOnHover
              highlightOnHoverColor="admin.0"
              verticalSpacing={"md"}
            >
              <Table.Thead bg={"gray.0"}>
                <Table.Tr>
                  <Table.Th>Kampanya Teklifi</Table.Th>
                  <Table.Th>Durum</Table.Th>
                  <Table.Th>Teklif Türü</Table.Th>
                  <Table.Th>Teklif Sayfası</Table.Th>
                  <Table.Th>Oluşturulma Tarihi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              {hasData && (
                <Table.Tbody>
                  {data.data.map((campaign) => (
                    <Table.Tr
                      key={campaign.id}
                      className="cursor-pointer"
                      onClick={() => {
                        push(`/admin/store/campaigns/${campaign.id}`);
                      }}
                    >
                      <Table.Td>
                        <Text fz={"md"} fw={700}>
                          {campaign.title}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge radius={"0"}>
                          {getCampaignStatusLabel(campaign.status)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fz={"md"}>
                          {getCampaignTypeLabel(campaign.campaignType)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {campaign.campaignType === "UP_SELLING"
                          ? getCampaignOfferPageLabel("CHECKOUT_PAGE")
                          : getCampaignOfferPageLabel(
                              campaign.campaignOfferType
                            )}
                      </Table.Td>
                      <Table.Td>
                        {DateFormatter.withTime(campaign.createdAt)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              )}
            </Table>
          </Table.ScrollContainer>
        )}
        {hasData && !isLoading && (
          <CustomPagination total={data.pagination.totalPages} />
        )}
      </Stack>
    </>
  );
};

export default AdminCampaignPage;
