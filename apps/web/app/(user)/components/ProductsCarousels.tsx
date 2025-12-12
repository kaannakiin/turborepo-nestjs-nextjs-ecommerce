"use client";

import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { Carousel } from "@mantine/carousel";
import { Stack, Title } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { ProductPageDataType } from "@repo/types";
import ProductCard from "./ProductCard";
import styles from "./ProductCarousel.module.css";
import { useTheme } from "@/context/theme-context/ThemeContext";

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
  const { media } = useTheme();
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
  });

  return (
    <Stack gap={"lg"} mt={"xl"} className={stackClassName} bg={"primary.0"}>
      {data && data.products.length > 0 && !isError && (
        <div className="w-full flex flex-col gap-4 max-w-[1500px] mx-auto">
          <Title order={4} pt={"md"} px={"md"}>
            {title}
          </Title>
          <Carousel
            classNames={styles}
            slideSize={
              media === "mobile" ? "50%" : media === "tablet" ? "33.33%" : "20%"
            }
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
