import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { queryClient } from "@lib/serverQueryClient";
import { GetProductPageReturnType } from "@repo/types";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Params } from "types/GlobalTypes";

const VariantProductClient = dynamic(
  () => import("./components/VariantProductClient"),
  {
    ssr: true,
    loading: () => <GlobalLoadingOverlay />,
  }
);

const BasicProductClient = dynamic(
  () => import("./components/BasicProductClient"),
  {
    ssr: true,
    loading: () => <GlobalLoadingOverlay />,
  }
);

const client = queryClient;

const ProductPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;
  const productMainData = await client.fetchQuery({
    queryKey: ["get-product", slug],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.BACKEND_URL}/users/products/get-product/${slug}`,
        {
          method: "GET",
        }
      );
      const data = (await res.json()) as GetProductPageReturnType;
      if (!data.success || !data.data) {
        return null;
      }
      return data.data;
    },
  });

  if (!productMainData) {
    return notFound();
  }

  if (productMainData.isVariant) {
    return <VariantProductClient productData={productMainData} />;
  }

  if (!productMainData.isVariant) {
    return <BasicProductClient productData={productMainData} />;
  }

  return notFound();
};

export default ProductPage;
