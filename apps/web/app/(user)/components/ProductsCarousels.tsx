"use client";

import { Carousel } from "@mantine/carousel";
import { Stack, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@repo/shared";
import { ProductPageDataType } from "@repo/types";
import ProductCard from "./ProductCard";
import styles from "./ProductCarousel.module.css";
import fetchWrapper from "@lib/fetchWrapper";

interface ProductsCarouselsProps {
  title: string;
  stackClassName?: string;
  productId: string;
}
const ProductsCarousels = ({
  title,
  stackClassName,
  productId,
}: ProductsCarouselsProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const { data, isError } = useQuery({
    queryKey: ["products", "similar-products", productId],
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        totalCount: number;
        products: ProductPageDataType[];
      }>("/users/products/similar-products/" + productId);
      if (!res.success) {
        return null;
      }

      return res.data;
    },
    refetchOnWindowFocus: false,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <Stack gap={"lg"} mt={"xl"} className={stackClassName} bg={"primary.0"}>
      {data && data.products.length > 0 && !isError && (
        <div className="w-full flex flex-col gap-4 max-w-[1250px] mx-auto">
          <Title order={4} pt={"md"} px={"md"}>
            {title}
          </Title>
          <Carousel
            classNames={styles}
            slideSize={isMobile ? "50%" : isTablet ? "33.33%" : "20%"}
            controlsOffset={"md"}
          >
            {data.products.map((product) => (
              <Carousel.Slide key={product.id}>
                <ProductCard product={product} />
              </Carousel.Slide>
            ))}
          </Carousel>
        </div>
      )}
    </Stack>
  );
};

export default ProductsCarousels;
