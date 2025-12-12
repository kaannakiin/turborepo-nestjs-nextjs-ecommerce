"use client";
import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { Stack, Title } from "@mantine/core";
import { useQuery } from "@repo/shared";
import { ProductPageDataType } from "@repo/types";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import ProductCard from "./ProductCard";
import { useTheme } from "@/context/theme-context/ThemeContext";

import "swiper/css";
import "swiper/css/navigation";
import styles from "./ProductCarousels.module.css";

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
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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

  const getSlidesPerView = () => {
    if (media === "mobile") return 2;
    if (media === "tablet") return 3;
    return 5;
  };

  return (
    <Stack gap={"lg"} mt={"xl"} className={stackClassName} bg={"primary.0"}>
      {data && data.products.length > 0 && !isError && (
        <div className="w-full flex flex-col gap-4 max-w-[1500px] mx-auto">
          <Title order={4} pt={"md"} px={"md"}>
            {title}
          </Title>

          <div className={styles.carouselWrapper}>
            <button
              type="button"
              className={`${styles.control} ${styles.controlPrev}`}
              onClick={() => swiperInstance?.slidePrev()}
              disabled={isBeginning}
              data-inactive={isBeginning || undefined}
              aria-label="Previous"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={`${styles.control} ${styles.controlNext}`}
              onClick={() => swiperInstance?.slideNext()}
              disabled={isEnd}
              data-inactive={isEnd || undefined}
              aria-label="Next"
            >
              <IconChevronRight size={20} />
            </button>

            <Swiper
              modules={[Navigation]}
              slidesPerView={getSlidesPerView()}
              spaceBetween={16}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onReachBeginning={() => setIsBeginning(true)}
              onReachEnd={() => setIsEnd(true)}
              className={styles.swiper}
            >
              {data.products.map((product) => (
                <SwiperSlide key={product.id} className={styles.slide}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </Stack>
  );
};

export default ProductsCarousels;
