import { queryClient } from "@lib/serverQueryClient";
import { getServerSideAllSearchParams } from "@lib/ui/product-helper";
import { ApiError, createServerFetch } from "@lib/wrappers/fetchWrapper";
import { CategoryPageReturnType } from "@repo/types";
import { cookies } from "next/headers";
import { Params, SearchParams } from "types/GlobalTypes";
const CategoryPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const cookieStore = await cookies();
  const slug = (await params).slug as string;
  const searchParamsObj = await searchParams;
  const urlSearchParams = getServerSideAllSearchParams(searchParamsObj);

  const api = createServerFetch().setCookies(cookieStore);

  const data = await queryClient.fetchQuery({
    queryKey: ["category-page-data", slug, searchParamsObj],
    queryFn: async () => {
      const res = await api.get<CategoryPageReturnType>(
        `/categories/${slug}${urlSearchParams ? `?${urlSearchParams}` : ""}`
      );

      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error || "Kategori verisi alınamadı");
      }

      return res.data;
    },
    staleTime: 0,
  });

  return (
    <pre>
      {JSON.stringify(
        data.products?.map((p) => p.variants),
        null,
        2
      )}
    </pre>
  );
};

export default CategoryPage;
