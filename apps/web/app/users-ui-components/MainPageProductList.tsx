"use client";

import { useTheme } from "@/(admin)/admin/(theme)/ThemeContexts/ThemeContext";
import ProductPriceFormatter from "@/(user)/components/ProductPriceFormatter";
import CustomImage from "@/components/CustomImage";
import { Carousel } from "@mantine/carousel";
import { AspectRatio, Card, Stack, Title } from "@mantine/core";
import { useQuery } from "@repo/shared";
import {
  ModalProductCardForAdmin,
  ProductListComponentType,
} from "@repo/types";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import styles from "./styles/ProductListCarousel.module.css";
import fetchWrapper from "@lib/fetchWrapper";

interface MainPageProductListProps {
  data: ProductListComponentType;
}

const MainPageProductList = ({ data }: MainPageProductListProps) => {
  const { media } = useTheme();

  const { data: products } = useQuery({
    queryKey: [
      "get-products-by-ids",
      data.items.map((item) => `${item.productId}-${item.variantId || "main"}`),
    ],
    enabled: data.items.length > 0,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const apiRes = await fetchWrapper.post<ModalProductCardForAdmin[]>(
        `/users/products/get-products-by-ids-for-product-list-carousel`,
        {
          body: JSON.stringify({ items: data.items }),
        }
      );
      if (apiRes.success) {
        return apiRes.data;
      }
    },
  });
  const { push } = useRouter();
  const createUrl = (product: ModalProductCardForAdmin) => {
    const baseUrl = `/${product.productSlug}`;
    if (product.isVariant && product.variantId) {
      const searchParams = new URLSearchParams();

      product.variants.forEach((variant) => {
        searchParams.append(
          variant.productVariantGroupSlug,
          variant.productVariantOptionSlug
        );
      });
      return `${baseUrl}?${searchParams.toString()}`;
    }
    return baseUrl;
  };
  return (
    <Stack bg={data.backgroundColor} py={"md  "}>
      {products && products.length > 0 ? (
        <Stack
          p={"md"}
          className="max-w-[1250px] w-full"
          mx={media === "desktop" ? "auto" : undefined}
          gap={"xs"}
        >
          <Title c={data.titleColor} order={4}>
            {data.title}
          </Title>
          <Carousel
            classNames={styles}
            controlsOffset={24}
            nextControlIcon={<IconChevronRight />}
            previousControlIcon={<IconChevronLeft />}
            withIndicators={false}
            slideSize={
              media === "desktop"
                ? "20%"
                : media === "tablet"
                  ? "33.33%"
                  : "50%" // Biraz daha küçük
            }
            slideGap={
              media === "desktop" ? "md" : media === "tablet" ? "sm" : "xs" // Küçük gap bırak
            }
            emblaOptions={{
              slidesToScroll:
                media === "desktop" ? 5 : media === "tablet" ? 3 : 2,
              align: "start",
            }}
          >
            {products.map((products) => {
              const url = createUrl(products);
              return (
                <Carousel.Slide
                  onClick={() => push(url)}
                  style={{ cursor: "pointer" }}
                  key={`${products.productId}-${products.variantId || "main"}`}
                >
                  <Card p={"md"} radius={0} bg={"transparent"} shadow={"none"}>
                    {products.image && (
                      <Card.Section>
                        <AspectRatio ratio={1} pos={"relative"}>
                          <CustomImage src={products.image.url} />
                        </AspectRatio>
                      </Card.Section>
                    )}
                    <Card.Section pt={"xs"}>
                      <Stack gap={"xs"}>
                        <Title order={6}>{products.productName}</Title>
                        {products.discountedPrice ? (
                          <div className="flex flex-col">
                            <ProductPriceFormatter
                              price={products.price}
                              fz={"xs"}
                              className="line-through"
                              c={"dimmed"}
                            />
                            <ProductPriceFormatter
                              fz={"md"}
                              fw={700}
                              price={products.discountedPrice}
                            />
                          </div>
                        ) : (
                          <>
                            <ProductPriceFormatter
                              fz={"md"}
                              fw={700}
                              price={products.price}
                            />
                          </>
                        )}
                      </Stack>
                    </Card.Section>
                  </Card>
                </Carousel.Slide>
              );
            })}
          </Carousel>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default MainPageProductList;
