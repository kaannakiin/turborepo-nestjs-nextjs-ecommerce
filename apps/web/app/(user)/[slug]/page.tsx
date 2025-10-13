import { queryClient } from "@lib/serverQueryClient";
import { GetProductPageReturnType } from "@repo/types";
import { notFound } from "next/navigation";
import { Params } from "types/GlobalTypes";
import VariantProductClient from "./components/VariantProductClient";
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
  return <pre>{JSON.stringify(productMainData, null, 2)}</pre>;
};

export default ProductPage;
